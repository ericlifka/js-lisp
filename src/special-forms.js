var List = require('./list');
var Eval = require('./eval');

module.exports = {
    "def": List.special(function (scopeEnvironment, list, callback) {
        if (!list || list.length() !== 2) {
            return callback(List.error("Def takes exactly 2 arguments, a symbol and a value: `(def a 2)`"));
        }

        var symbol = list.car;
        var statement = list.cdr.car;

        if (!symbol || !statement) {
            return callback(List.error("Symbol given to def must be valid"));
        }

        Eval.evaluateStatement(statement, scopeEnvironment, function (value) {
            scopeEnvironment.putSymbolValue(symbol.name, value);
            callback(value);
        });
    }),

    "fn": List.special(function (scopeEnvironment, list, callback) {
        if (!list || list.length() < 2) {
            return callback(List.error("Invalid lambda, must be of the form `(fn (...arguments) ...body)`"));
        }

        var formals = list.car;
        var body = list.cdr;

        callback(List.func(function (parameters, innerCallback) {
            innerCallback(List.error("Not Implemented"));
        }));
    }),

    "def-fn": List.special(function (list, callback) {
        callback(List.error("Not Implemented"));
    }),

    "def-macro": List.special(function (list, callback) {
        callback(List.error("Not Implemented"));
    })
};
