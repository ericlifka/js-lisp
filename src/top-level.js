var Environment = require('./environment');
var ConstructModules = require('./constructs');

function loadModuleFunctions(env, module) {
    for (var symbol in module) {
        env.putSymbolValue(symbol, module[symbol]);
    }
}

function addBuiltins(env) {
    for (var module in ConstructModules) {
        loadModuleFunctions(env, ConstructModules[module]);
    }

    return env;
}

module.exports = {
    create: function () {
        return addBuiltins(Environment.create());
    }
};
