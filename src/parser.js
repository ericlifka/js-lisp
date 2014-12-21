var ParseError = require('./error').ParseError;
var List = require('./list');

function isWhitespace(char) {
    return /\s/.test(char);
}

function isSymbolTerminator(char) {
    return isWhitespace(char) || char === ')';
}

function isLegalSymbolChar(char) {
    return /[a-zA-Z\d_?:!@#$%^&*<>=+.\/\-]/.test(char);
}

function isNumeric(symbol) {
    return symbol && symbol.length > 0 && !isNaN(symbol);
}

function convertSymbolToNumber(cell) {
    cell.value = +cell.name;
    cell.type = 'number';
    delete cell.name;
}

function Parser() {
    this.stringQueue = [];
    this.lists = [];
    this.inProcessLists = [];
    this.currentParseString = null;
    this.currentSymbol = null;
    this.currentString = null;
    this.parsePosition = 0;
    this.parseDepth = 0;
}

Parser.prototype = {
    parseString: function (/* strings... */) {
        var i = 0;
        var length = arguments.length;
        var str;
        for (; i < length; i++) {
            str = arguments[i];
            if (typeof str === "string") {
                this.stringQueue.push(str);
            }
        }

        this._processQueue();
    },
    parseStrings: function (strings) {
        this.parseString.apply(this, strings);
    },
    parseState: function () {
        return {
            error: this.errorState,
            complete: !!(
                !this.currentParseString &&
                this.parsePosition === 0 &&
                this.stringQueue.length === 0)
        };
    },
    getLists: function () {
        return this.lists;
    },

    _processQueue: function () {
        if (this.currentParseString && this.errorState) {
            return;
        }

        while (this.stringQueue.length > 0) {
            this.currentParseString = this.stringQueue.pop();
            this.parsePosition = 0;
            this.parseDepth = 0;

            if (!this.currentParseString ||
                this.currentParseString.length === 0) {

                this.currentParseString = null;
                continue;
            }

            while (!this.errorState &&
                this.parsePosition < this.currentParseString.length) {

                this.currentChar = this.currentParseString[this.parsePosition];
                this._parseStep();
                this.parsePosition++;
            }

            if (!this.errorState &&
                this.parsePosition === this.currentParseString.length) {

                this.currentParseString = null;
                this.parsePosition = 0;
            }
        }
    },
    _parseStep: function () {
        if (this.currentString) {
            if (this.currentChar === '"' && this.currentParseString[this.parsePosition - 1] !== "\\") {
                // If there is a string being built then close it
                this.currentString = null;
            }
            else {
                this.currentString.value += this.currentChar;
            }
        }

        else if (this.currentSymbol) {
            if (isSymbolTerminator(this.currentChar)) {
                if (isNumeric(this.currentSymbol.name)) {
                    convertSymbolToNumber(this.currentSymbol);
                }

                this.currentSymbol = null;
            }

            else if (isLegalSymbolChar(this.currentChar)) {
                this.currentSymbol.name += this.currentChar;
            }

            else {
                this.errorState = "Invalid character in Symbol '" + this.currentChar +
                    "' at buffer position " + this.parsePosition;
            }
        }

        else if (this.currentChar === '(') {
            var newList = List.cons();

            this._storeNewCell(newList);
            this.inProcessLists.push(newList);
            this.parseDepth++;
        }

        else if (this.currentChar === ')') {
            if (this.inProcessLists.length === 0) {
                this.errorState = "Unbalanced List - Found close ')' without matching open '(' at buffer position " +
                    this.parsePosition;
            }
            else {
                this.inProcessLists.pop();
                this.parseDepth--;
            }
        }

        else if (this.currentChar === '"') {
            // Create a new string to build
            var newString = List.string();

            this._storeNewCell(newString);
            this.currentString = newString;
        }

        else if (isLegalSymbolChar(this.currentChar)) {
            var newSymbol = List.symbol(this.currentChar);

            this._storeNewCell(newSymbol);
            this.currentSymbol = newSymbol;
        }

        else if (isWhitespace(this.currentChar)) {
            // ignore whitespace outside of strings
        }

        else {
            // this is a catch all of characters we don't know how to parse yet
            this.errorState = "Unexpected character '" + this.currentChar + "' at " + this.parsePosition;
        }
    },
    _storeNewCell: function (cell) {
        if (this.parseDepth === 0) {
            this.lists.push(cell);
        } else {
            List.addToEnd(this.inProcessLists[0], cell);
        }
    }
};

Parser.parse = function (string) {
    var parser = new Parser();
    parser.parseString(string);
    var state = parser.parseState();
    if (state.error) {
        throw new ParseError(state.error);
    }
    if (!state.complete) {
        throw new ParseError("Parser.parse only handles balanced list segments");
    }
    var lists = parser.getLists();
    if (lists.length !== 1) {
        throw new ParseError("Parser.parse only supports single lists");
    }
    return lists[0];
};

module.exports = Parser;
