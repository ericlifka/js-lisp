var Environment = require('./environment');
var MathBuiltins = require('./math');
var SpecialForms = require('./special-forms');

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
    loadFromModule(env, SpecialForms, "macro");
    loadFromModule(env, SpecialForms, "def-fn");
    loadFromModule(env, SpecialForms, "def-macro");

    return env;
}

module.exports = {
    create: function () {
        return addBuiltins(Environment.create());
    }
};
