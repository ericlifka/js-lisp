var List = require('../list');

function compare(parameters, symbol, comparisonFn) {
    if (!parameters || parameters.length() !== 2) {
        return List.error(symbol + " only supports two arguments");
    }

    return List.boolean(List.compareCells(parameters.car, parameters.cdr.car, comparisonFn));
}

module.exports = {
    "=": List.func(function (parameters) {
        return compare(parameters, "=", function (valA, valB) {
            return valA === valB;
        })
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
