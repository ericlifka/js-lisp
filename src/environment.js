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
        while (parameters) {
            if (parameters.car.type !== 'number') {
                return callback(List.error("Encountered non numeric value in mathematical operator: '" + parameters.car + "'"));
            }
            base = combinator(base, parameters.car.value);
            parameters = parameters.cdr;
        }
        callback(List.number(base));
    };
    env.symbols['+'] = function (parameters, callback) {
        combineNumbers(
            0,
            parameters,
            function (a, b) {
                return a + b;
            },
            callback
        );
    };
    return env;
}

module.exports = {
    create: create,
    createTopLevel: createTopLevel,
    addBuiltins: addBuiltins
};
