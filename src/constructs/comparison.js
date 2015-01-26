var List = require('../list');

module.exports = {
    "=": List.func(function (parameters) {
        // TODO: Only implementing strict equals for now, add fuzzy equals at some point
        if (!parameters || parameters.length() !== 2) {
            return List.error("= only supports two arguments");
        }

        return List.boolean(List.compareCells(parameters.car, parameters.cdr.car, function (valA, valB) {
            return valA === valB;
        }));
    }),

    ">": List.func(function (parameters) {

    }),

    "<": List.func(function (parameters) {

    }),

    ">=": List.func(function (parameters) {

    }),

    "<=": List.func(function (parameters) {

    })
};
