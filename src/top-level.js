var Environment = require('./environment');

var modules = [
    require('./constructs/math'),
    require('./constructs/special-forms')
];

function loadModuleFunctions(env, module) {
    for (var symbol in module) {
        if (module.hasOwnProperty(symbol)) {
            env.putSymbolValue(symbol, module[symbol]);
        }
    }
}

function addBuiltins(env) {
    modules.forEach(function (module) {
        loadModuleFunctions(env, module);
    });

    return env;
}

module.exports = {
    create: function () {
        return addBuiltins(Environment.create());
    }
};
