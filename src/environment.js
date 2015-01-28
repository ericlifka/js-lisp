var Environment = (function () {
    function Environment(options) {
        this.parent = options.parent;
        this.readOnly = options.readOnly;
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

function create(options) {
    return new Environment(options);
}

module.exports = {
    create: create
};
