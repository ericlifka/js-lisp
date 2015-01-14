var List = require('./list');

module.exports = {
    "fn": List.macro(function (list, callback) {
        callback(List.error("Not Implemented"));
    }),
    "def-fn": List.macro(function (list, callback) {
        callback(List.error("Not Implemented"));
    }),
    "def-macro": List.macro(function (list, callback) {
        callback(List.error("Not Implemented"));
    })
};
