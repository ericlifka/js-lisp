var List = require('./list');

module.exports = {
    "fn": List.special(function (scopeEnvironment, list, callback) {
        callback(List.error("Not Implemented"));
    }),
    "def-fn": List.special(function (list, callback) {
        callback(List.error("Not Implemented"));
    }),
    "def-macro": List.special(function (list, callback) {
        callback(List.error("Not Implemented"));
    })
};
