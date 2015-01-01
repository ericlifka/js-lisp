
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
    env.symbols['+'] = function (argList) {
        var sum = 0;
        while (argList) {
            if (argList.car.type === 'number') {
                sum += argList.car.value;
            }
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
