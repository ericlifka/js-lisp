var List = require('./list');

var combineNumbers = function (base, parameters, combinator, callback) {
    if (!List.isNumber(base)) {
        return callback(List.error("Encountered non numeric value in mathematical operator: '" + base + "'"));
    }

    var aggregate = base.value;
    while (parameters) {
        if (!List.isNumber(parameters.car)) {
            return callback(List.error("Encountered non numeric value in mathematical operator: '" + parameters.car + "'"));
        }
        aggregate = combinator(aggregate, parameters.car.value);
        parameters = parameters.cdr;
    }
    callback(List.number(aggregate));
};

module.exports = {
    "+": function (parameters, callback) {
        combineNumbers(List.number(0), parameters, function (a, b) { return a + b; }, callback);
    },

    "*": function (parameters, callback) {
        combineNumbers(List.number(1), parameters, function (a, b) { return a * b; }, callback);
    },

    "-": function (parameters, callback) {
        if (!parameters) {
            callback(List.error("- needs at least 1 argument"));
        }
        else if (parameters.length() === 1 && List.isNumber(parameters.car)) {
            callback(List.number(-parameters.car.value));
        }
        else {
            combineNumbers(parameters.car, parameters.cdr, function (a, b) { return a - b; }, callback);
        }
    },

    "/": function (parameters, callback) {
        if (!parameters) {
            callback(List.error("/ needs at least 1 argument"));
        }
        else if (parameters.length() === 1 && List.isNumber(parameters.car)) {
            callback(List.number(1 / parameters.car.value));
        }
        else {
            combineNumbers(parameters.car, parameters.cdr, function (a, b) { return a / b; }, callback);
        }
    }
};
