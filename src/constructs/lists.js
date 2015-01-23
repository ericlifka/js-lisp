var List = require('./../list');

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
    })
};
