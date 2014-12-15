
function Environment() {
    this.parent = null;
    this.symbols = { };
}

function create() {
    return new Environment();
}

module.exports = {
    create: create
};
