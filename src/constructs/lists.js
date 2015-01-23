var List = require('./../list');

var car = List.func(function (parameters, callback) {
    if (!parameters || parameters.length() < 1) {
        return callback(List.error("car - needs at least 1 parameter"));
    }

    var arg = parameters.car;
    if (!List.isCons(arg)) {
        return callback(List.error("car - parameter must be a cons cell"));
    }

    callback(arg.car);
});

var cdr = List.func(function (parameters, callback) {
    if (!parameters || parameters.length() < 1) {
        return callback(List.error("cdr - needs at least 1 parameter"));
    }

    var arg = parameters.car;
    if (!List.isCons(arg)) {
        return callback(List.error("cdr - parameter must be a cons cell"));
    }

    callback(arg.cdr);
});

module.exports = {
    "list": List.func(function (parameters, callback) {
        callback(parameters);
    }),

    "cons": List.func(function (parameters, callback) {
        if (!parameters) {
            callback(null);
        }
        else if (parameters.length() === 1) {
            callback(List.cons(parameters.car));
        }
        else {
            callback(List.cons(parameters.car, parameters.cdr.car));
        }
    }),

    "car": car,
    "first": car,
    "cdr": cdr,
    "rest": cdr
};
