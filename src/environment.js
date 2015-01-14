var MathBuiltins = require('./math');
var SpecialForms = require('./special-forms');

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
    env.symbols['+'] = MathBuiltins['+'];
    env.symbols['-'] = MathBuiltins['-'];
    env.symbols['*'] = MathBuiltins['*'];
    env.symbols['/'] = MathBuiltins['/'];

    env.symbols['fn'] = SpecialForms['fn'];
    env.symbols['def-fn'] = SpecialForms['def-fn'];
    env.symbols['def-macro'] = SpecialForms['def-macro'];

    return env;
}

module.exports = {
    create: create,
    createTopLevel: createTopLevel,
    addBuiltins: addBuiltins
};
