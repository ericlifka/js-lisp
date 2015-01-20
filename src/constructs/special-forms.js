var List = require('./../list');
var Eval = require('./../eval');
var Environment = require('./../environment');

function createCallable(callableType, scopeEnvironment, list, callback) {
    if (!list || list.length() < 2) {
        return callback(List.error("Invalid lambda, must be of the form `(fn (...arguments) ...body)`"));
    }

    var formals = list.car;
    var body = list.cdr;
    var arity = formals.length();

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

        var statement = list.car.clone();
        var queue = [];
        var queueList = function (list) {
            while (list) {
                if (list.car) {
                    queue.push(list.car);
                }

                list = list.cdr;
            }
        };
        var processQueue = function () {
            if (queue.length === 0) {
                return;
            }
            var nextItem = queue.shift();

            if (List.isCons(nextItem)) {
                if (isUnquoteList(nextItem)) {
                    return Eval.evaluateStatement(nextItem, scopeEnvironment, function (resultCell) {
                        nextItem.copyFrom(resultCell);
                        processQueue();
                    });
                }
                else {
                    queueList(nextItem);
                }
            }

            processQueue();
        };

        callback(List.error("Not Implemented"));
    }),

    "unquote": List.special(function (scopeEnvironment, list, callback) {
        callback(List.error("Not Implemented"));
    }),

    "unquote-splat": List.special(function (scopeEnvironment, list, callback) {
        callback(List.error("Not Implemented"));
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

    "def-fn": List.special(function (list, callback) {
        callback(List.error("Not Implemented"));
    }),

    "def-macro": List.special(function (list, callback) {
        callback(List.error("Not Implemented"));
    })
};
