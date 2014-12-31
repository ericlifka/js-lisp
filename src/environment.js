
function Environment() {
    this.parent = null;
    this.symbols = { };
}

function create() {
    return new Environment();
}

function createTopLevel() {
    return addBuiltins(create());
}

function addBuiltins(env) {
    env.symbols['+'] = function () {
        var sum = 0;
        for (var i = 0; i < arguments.length; i++) {
            sum += arguments[i];
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
