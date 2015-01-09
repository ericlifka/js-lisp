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
    env.symbols['+'] = function (parameters, callback) {
        var sum = 0;
        while (parameters) {
            if (parameters.car.type !== 'number') {
                return callback(List.error("Encountered non numeric value in '+': '" + parameters.car + "'"));
            }
            sum += parameters.car.value;
            parameters = parameters.cdr;
        }
        callback(List.number(sum));
    };
    return env;
}

module.exports = {
    create: create,
    createTopLevel: createTopLevel,
    addBuiltins: addBuiltins
};
