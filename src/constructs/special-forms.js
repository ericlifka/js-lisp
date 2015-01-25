var List = require('./../list');
var Eval = require('./../eval');
var Environment = require('./../environment');

function isUnquoteList(list) {
    return list &&
        list.car &&
        list.car.type === 'symbol' &&
        list.car.name === 'unquote';
}

function isSpliceList(list) {
    return list &&
        list.car &&
        list.car.type === 'symbol' &&
        list.car.name === 'unquote-splice';
}

function spliceInto(resultList, context) {
    // Save a reference to the items that come after the context item
    var rest = context.cdr;

    // Replace the context cell with the resultList, effectively inserting the result items
    resultList.cloneInto(context);

    // Find the end of the result list
    while (context.cdr) {
        context = context.cdr;
    }

    // Append the saved items to the end of the result list, finishing the in place splice
    context.cdr = rest;
}

function createCallable(scopeEnvironment, list) {
    if (!list || list.length() < 2) {
        return List.error("Invalid lambda, must be of the form `(fn (...arguments) ...body)`");
    }

    var formals = list.car;
    var body = list.cdr;
    var arity = formals.length();

    if (!List.isCons(formals)) {
        return List.error("Invalid lambda, first argument must be a list");
    }

    return function (parameters) {
        var paramsSupplied = parameters ? parameters.length() : 0;
        if (arity !== paramsSupplied) {
            return List.error("Function defined with arity " +
                arity + " but supplied " + paramsSupplied + " parameters");
        }

        var invocationEnvironment = Environment.create(scopeEnvironment);
        var formal = formals;
        var parameter = parameters;

        while (formal && parameter) {
            invocationEnvironment.putSymbolValue(formal.car.name, parameter.car);

            formal = formal.cdr;
            parameter = parameter.cdr;
        }

        var statement;
        var result;
        var currentStatement = body;
        while (currentStatement) {
            statement = currentStatement.car;
            currentStatement = currentStatement.cdr;

            result = Eval.evaluateStatement(statement, invocationEnvironment);
        }

        return result || List.nullValue();
    };
}

function defTransform(list, callableSymbol) {
    if (!list || list.length() < 3) {
        return List.error("expected form (def-fn symbol (...arguments) ...body)");
    }

    // Input structure:  (def-macro name (...arguments) ...body)
    // Output structure: (def name (fn (...arguments) ...body))
    var def = List.symbol("def");
    var macroSym = List.symbol(callableSymbol);
    var name = list.car;
    var macroDef = list.cdr;

    return List.createList(
        def,
        name,
        List.cons(macroSym, macroDef)
    );
}

module.exports = {
    "quote": List.special(function (scopeEnvironment, list) {
        if (!list || !list.car) {
            return List.nullValue();
        }
        else {
            return list.car;
        }
    }),

    "quasi-quote": List.special(function (scopeEnvironment, list, callback) {
        if (!list) {
            return callback(List.nullValue());
        }

        var structure = list.clone();

        var queue = [structure];
        var queueList = function (list) {
            while (list) {
                queue.push(list);
                list = list.cdr;
            }
        };

        var processQueue = function () {
            if (queue.length === 0) {
                return callback(structure.car);
            }

            var context = queue.shift();
            var item = context.car;

            if (!List.isCons(item)) {
                return processQueue();
            }

            if (isUnquoteList(item)) {
                return Eval.evaluateStatement(item, scopeEnvironment, function (resultCell) {
                    resultCell.cloneInto(item);
                    processQueue();
                });
            }

            if (isSpliceList(item)) {
                return Eval.evaluateStatement(item, scopeEnvironment, function (resultList) {
                    if (List.isCons(resultList)) {
                        spliceInto(resultList, context)
                    }
                    else {
                        resultList.cloneInto(item);
                    }
                    processQueue();
                });
            }

            queueList(item);
            processQueue();
        };

        processQueue();
    }),

    "unquote": List.special(function (scopeEnvironment, list) {
        if (!list || !list.car) {
            return List.nullValue();
        }

        return Eval.evaluateStatement(list.car, scopeEnvironment);
    }),

    "unquote-splice": List.special(function (scopeEnvironment, list) {
        if (!list || !list.car) {
            return List.nullValue();
        }

        return Eval.evaluateStatement(list.car, scopeEnvironment);
    }),

    "def": List.special(function (scopeEnvironment, list, callback) {
        if (!list || list.length() !== 2) {
            return List.error("Def takes exactly 2 arguments, a symbol and a value: `(def a 2)`");
        }

        var symbol = list.car;
        var statement = list.cdr.car;

        if (!symbol || !symbol.name) {
            return List.error("Symbol given to def must be valid");
        }

        if (!statement) {
            return List.error("Statement given to def must be valid");
        }

        var resultValue = Eval.evaluateStatement(statement, scopeEnvironment);
        scopeEnvironment.putSymbolValue(symbol.name, resultValue);
        return resultValue;
    }),

    "fn": List.special(function (scopeEnvironment, list) {
        return List.func(createCallable(scopeEnvironment, list));
    }),

    "macro": List.special(function (scopeEnvironment, list, callback) {
        return List.macro(createCallable(scopeEnvironment, list));
    }),

    "def-fn": List.macro(function (list, callback) {
        callback(defTransform(list, "fn"));
    }),

    "def-macro": List.macro(function (list, callback) {
        callback(defTransform(list, "macro"));
    }),

    "if": List.special(function (scopeEnvironment, list, callback) {
        if (!list || list.length < 2) {
            return callback(List.error("if - invalid structure, expected (if booleanStatement trueStatement ?falseStatement"));
        }

        var boolStatement = list.car;
        var trueStatement = list.cdr.car;
        if (list.length() >= 3) {
            var falseStatement = list.cdr.cdr.car;
        }

        Eval.evaluateStatement(boolStatement, scopeEnvironment, function (boolValue) {
            var chosenStatement = List.cellToBool(boolValue) ?
                trueStatement :
                falseStatement;

            if (chosenStatement) {
                Eval.evaluateStatement(chosenStatement, scopeEnvironment, callback);
            }
            else {
                callback(List.nullValue());
            }
        });
    })
};
