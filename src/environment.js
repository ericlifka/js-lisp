var List = require('./list');

function Environment() {
    this.parent = null;
    this.symbols = { };
}

Environment.prototype.getSymbolValue = function (symbol) {
    if (this.symbols.hasOwnProperty(symbol)) {
        return this.symbols[symbol];
    }
    else if (this.parent) {
        return this.parent.getSymbolValue(symbol);
    }
    else {
        return null;
    }
};

function create() {
    return new Environment();
}

function createTopLevel() {
    return addBuiltins(create());
}

function addBuiltins(env) {
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

    env.symbols['+'] = function (parameters, callback) {
        combineNumbers(List.number(0), parameters, function (a, b) { return a + b; }, callback);
    };

    env.symbols['*'] = function (parameters, callback) {
        combineNumbers(List.number(1), parameters, function (a, b) { return a * b; }, callback);
    };

    env.symbols['-'] = function (parameters, callback) {
        if (!parameters) {
            callback(List.error("'-' needs at least 1 argument"));
        }
        else if (parameters.length() === 1 && List.isNumber(parameters.car)) {
            callback(List.number(-parameters.car.value));
        }
        else {
            combineNumbers(parameters.car, parameters.cdr, function (a, b) { return a - b; }, callback);
        }
    };

    return env;
}

module.exports = {
    create: create,
    createTopLevel: createTopLevel,
    addBuiltins: addBuiltins
};
