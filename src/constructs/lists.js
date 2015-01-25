var List = require('./../list');

var car = List.func(function (parameters) {
    if (!parameters || parameters.length() < 1) {
        return List.error("car - needs at least 1 parameter");
    }

    var arg = parameters.car;
    if (!List.isCons(arg)) {
        return List.error("car - parameter must be a cons cell");
    }

    return arg.car;
});

var cdr = List.func(function (parameters) {
    if (!parameters || parameters.length() < 1) {
        return List.error("cdr - needs at least 1 parameter");
    }

    var arg = parameters.car;
    if (!List.isCons(arg)) {
        return List.error("cdr - parameter must be a cons cell");
    }

    return arg.cdr;
});

module.exports = {
    "list": List.func(function (parameters) {
        return parameters;
    }),

    "cons": List.func(function (parameters) {
        if (!parameters) {
            return null;
        }
        else if (parameters.length() === 1) {
            return List.cons(parameters.car);
        }
        else {
            return List.cons(parameters.car, parameters.cdr.car);
        }
    }),

    "car": car,
    "first": car,
    "cdr": cdr,
    "rest": cdr
};
