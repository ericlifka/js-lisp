var List = require('./list');

module.exports = {
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
