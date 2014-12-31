
function Environment() {
    this.parent = null;
    this.symbols = { };
}

function create() {
    return new Environment();
}

function addBuiltins(env) {
    env.symbols['+'] = function () {
        var sum = 0;
        for (var i = 0; i < arguments.length; i++) {
            sum += arguments[i];
        }
        return sum;
    };
}

module.exports = {
    create: create
};
