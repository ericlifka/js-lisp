var EvaluationError = require('./error').EvaluationError;

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
    env.symbols['+'] = function (argList) {
        var sum = 0;
        while (argList) {
            if (argList.car.type !== 'number') {
                throw new EvaluationError("Encountered non numeric value in '+': '" + argList.car + "'");
            }
            sum += argList.car.value;
            argList = argList.cdr;
        }
        return sum;
    };
    return env;
}

module.exports = {
    create: create,
    createTopLevel: createTopLevel,
    addBuiltins: addBuiltins
};
