var MathBuiltins = require('./math');
var SpecialForms = require('./special-forms');

var Environment = (function () {
    function Environment() {
        this.parent = null;
        this.symbols = { };
    }

    Environment.prototype = {
        getSymbolValue: function (symbol) {
            if (this.symbols.hasOwnProperty(symbol)) {
                return this.symbols[symbol];
            }
            else if (this.parent) {
                return this.parent.getSymbolValue(symbol);
            }
            else {
                return null;
            }
        },

        putSymbolValue: function (symbol, value) {
            this.symbols[symbol] = value;
        }
    };

    return Environment;
})();

function create() {
    return new Environment();
}

function createTopLevel() {
    return addBuiltins(create());
}

function addBuiltins(env) {
    env.putSymbolValue('+', MathBuiltins['+']);
    env.putSymbolValue('-', MathBuiltins['-']);
    env.putSymbolValue('*', MathBuiltins['*']);
    env.putSymbolValue('/', MathBuiltins['/']);

    env.putSymbolValue('fn', SpecialForms['fn']);
    env.putSymbolValue('def-fn', SpecialForms['def-fn']);
    env.putSymbolValue('def-macro', SpecialForms['def-macro']);

    return env;
}

module.exports = {
    create: create,
    createTopLevel: createTopLevel,
    addBuiltins: addBuiltins
};
