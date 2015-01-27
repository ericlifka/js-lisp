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

        hasSymbolValue: function (symbol) {
            return this.symbols.hasOwnProperty(symbol);
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

module.exports = {
    create: create
};
