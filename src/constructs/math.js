var List = require('./../list');

function combineNumbers(base, parameters, combinator, callback) {
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

function safeCombine(operator, parameters, monad, combinator, callback) {
    if (!parameters) {
        callback(List.error(operator + " needs at least 1 argument"));
    }
    else if (parameters.length() === 1 && List.isNumber(parameters.car)) {
        callback(List.number(monad(parameters.car.value)));
    }
    else {
        combineNumbers(parameters.car, parameters.cdr, combinator, callback);
    }
}

module.exports = {
    "+": List.func(function (parameters, callback) {
        combineNumbers(List.number(0), parameters, function (a, b) { return a + b; }, callback);
    }),

    "*": List.func(function (parameters, callback) {
        combineNumbers(List.number(1), parameters, function (a, b) { return a * b; }, callback);
    }),

    "-": List.func(function (parameters, callback) {
        safeCombine(
            "-",
            parameters,
            function (a) { return -a; },
            function (a, b) { return a - b; },
            callback
        );
    }),

    "/": List.func(function (parameters, callback) {
        safeCombine(
            "/",
            parameters,
            function (a) { return 1 / a; },
            function (a, b) { return a / b; },
            callback
        );
    })
};
