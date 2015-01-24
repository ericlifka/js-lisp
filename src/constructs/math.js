var List = require('./../list');

function combineNumbers(base, parameters, combinator) {
    if (!List.isNumber(base)) {
        return List.error("Encountered non numeric value in mathematical operator: '" + base + "'");
    }

    var aggregate = base.value;
    while (parameters) {
        if (!List.isNumber(parameters.car)) {
            return List.error("Encountered non numeric value in mathematical operator: '" + parameters.car + "'");
        }
        aggregate = combinator(aggregate, parameters.car.value);
        parameters = parameters.cdr;
    }
    return List.number(aggregate);
};

function safeCombine(operator, parameters, monad, combinator) {
    if (!parameters) {
        return List.error(operator + " needs at least 1 argument");
    }
    else if (parameters.length() === 1 && List.isNumber(parameters.car)) {
        return List.number(monad(parameters.car.value));
    }
    else {
        return combineNumbers(parameters.car, parameters.cdr, combinator);
    }
}

module.exports = {
    "+": List.func(function (parameters) {
        return combineNumbers(List.number(0), parameters, function (a, b) { return a + b; });
    }),

    "*": List.func(function (parameters) {
        return combineNumbers(List.number(1), parameters, function (a, b) { return a * b; });
    }),

    "-": List.func(function (parameters) {
        return safeCombine(
            "-",
            parameters,
            function (a) { return -a; },
            function (a, b) { return a - b; }
        );
    }),

    "/": List.func(function (parameters) {
        return safeCombine(
            "/",
            parameters,
            function (a) { return 1 / a; },
            function (a, b) { return a / b; }
        );
    })
};
