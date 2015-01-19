var Environment = require('./environment');
var MathBuiltins = require('./math');
var SpecialForms = require('./special-forms');

function loadModuleFunctions(env, module) {
    for (var symbol in module) {
        if (module.hasOwnProperty(symbol)) {
            env.putSymbolValue(symbol, module[symbol]);
        }
    }
}

function addBuiltins(env) {
    loadModuleFunctions(env, MathBuiltins);
    loadModuleFunctions(env, SpecialForms);

    return env;
}

module.exports = {
    create: function () {
        return addBuiltins(Environment.create());
    }
};
