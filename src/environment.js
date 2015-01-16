var MathBuiltins = require('./math');
var SpecialForms = require('./special-forms');

var Environment = (function () {
    function Environment(parent) {
        this.parent = parent;
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

function create(parent) {
    return new Environment(parent);
}

function createTopLevel() {
    return addBuiltins(create());
}

function loadFromModule(env, module, symbol) {
    env.putSymbolValue(symbol, module[symbol]);
}

function addBuiltins(env) {
    loadFromModule(env, MathBuiltins, "+");
    loadFromModule(env, MathBuiltins, "-");
    loadFromModule(env, MathBuiltins, "*");
    loadFromModule(env, MathBuiltins, "/");

    loadFromModule(env, SpecialForms, "def");
    loadFromModule(env, SpecialForms, "fn");
    loadFromModule(env, SpecialForms, "def-fn");
    loadFromModule(env, SpecialForms, "def-macro");

    return env;
}

module.exports = {
    create: create,
    createTopLevel: createTopLevel,
    addBuiltins: addBuiltins
};
