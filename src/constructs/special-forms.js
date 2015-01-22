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

function createCallable(callableType, scopeEnvironment, list, callback) {
    if (!list || list.length() < 2) {
        return callback(List.error("Invalid lambda, must be of the form `(fn (...arguments) ...body)`"));
    }

    var formals = list.car;
    var body = list.cdr;
    var arity = formals.length();

    if (!List.isCons(formals)) {
        return callback(List.error("Invalid lambda, first argument must be a list"));
    }

    var callable = callableType(function (parameters, innerCallback) {
        var paramsSupplied = parameters ? parameters.length() : 0;
        if (arity !== paramsSupplied) {
            return innerCallback(List.error("Function defined with arity " +
                arity + " but supplied " + paramsSupplied + " parameters"));
        }

        var invocationEnvironment = Environment.create(scopeEnvironment);
        var formal = formals;
        var parameter = parameters;

        while (formal && parameter) {
            invocationEnvironment.putSymbolValue(formal.car.name, parameter.car);

            formal = formal.cdr;
            parameter = parameter.cdr;
        }

        var currentStatement = body;
        var evaluateBody = function (resultValue) {
            if (currentStatement) {
                var statement = currentStatement.car;
                currentStatement = currentStatement.cdr;

                Eval.evaluateStatement(statement, invocationEnvironment, evaluateBody);
            }
            else {
                innerCallback(resultValue || List.nullValue());
            }
        };

        evaluateBody();
    });

    callback(callable);
}

module.exports = {
    "quote": List.special(function (scopeEnvironment, list, callback) {
        if (!list || !list.car) {
            callback(List.nullValue());
        }
        else {
            callback(list.car);
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

    "unquote": List.special(function (scopeEnvironment, list, callback) {
        if (!list || !list.car) {
            return callback(List.nullValue());
        }
        Eval.evaluateStatement(list.car, scopeEnvironment, callback);
    }),

    "unquote-splice": List.special(function (scopeEnvironment, list, callback) {
        if (!list || !list.car) {
            return callback(List.nullValue());
        }
        Eval.evaluateStatement(list.car, scopeEnvironment, callback);
    }),

    "def": List.special(function (scopeEnvironment, list, callback) {
        if (!list || list.length() !== 2) {
            return callback(List.error("Def takes exactly 2 arguments, a symbol and a value: `(def a 2)`"));
        }

        var symbol = list.car;
        var statement = list.cdr.car;

        if (!symbol || !symbol.name) {
            return callback(List.error("Symbol given to def must be valid"));
        }

        if (!statement) {
            return callback(List.error("Statement given to def must be valid"));
        }

        Eval.evaluateStatement(statement, scopeEnvironment, function (value) {
            scopeEnvironment.putSymbolValue(symbol.name, value);
            callback(value);
        });
    }),

    "fn": List.special(function (scopeEnvironment, list, callback) {
        return createCallable(List.func, scopeEnvironment, list, callback);
    }),

    "macro": List.special(function (scopeEnvironment, list, callback) {
        return createCallable(List.macro, scopeEnvironment, list, callback);
    }),

    "def-fn": List.special(function (scopeEnvironment, list, callback) {
        if (!list || list.length() < 3) {
            return callback(List.error("expected form (def-fn symbol (...arguments) ...body)"));
        }

        var symbol = list.car;
        var functionList = list.cdr;
        var functionCell = createCallable(List.func, scopeEnvironment, functionList, callback);

        callback(List.error("Not Implemented"));
    }),

    "def-macro": List.special(function (scopeEnvironment, list, callback) {
        callback(List.error("Not Implemented"));
    })
};
