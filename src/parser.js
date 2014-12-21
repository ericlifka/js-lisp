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
    addString: function (string) {
        this.stringQueue.push(string);
        this._processQueue();
    },
    parseState: function () {
        return {
            error: this.errorState,
            incomplete: false
        };
    },
    getLists: function () {
        return this.lists;
    },

    _processQueue: function () {
        if (this.currentParseString) {
            // check for errors and continue parsing
            return;
        }
        if (this.stringQueue.length === 0) {
            return;
        }

        this.currentParseString = this.stringQueue.pop();
        if (this.currentParseString.length === 0) {
            return;
        }

        this.parsePosition = 0;
        this.parseDepth = 0;

        while (this.parsePosition < this.currentParseString.length && !this.errorState) {
            this._parseStep();
        }
    },
    _parseStep: function () {
        var char = this.currentParseString[this.parsePosition];

        if (this.currentString) {
            if (char === '"' && this.currentParseString[this.parsePosition - 1] !== "\\") {
                // If there is a string being built then close it
                this.currentString = null;
            }
            else {
                this.currentString.value += char;
            }
        }

        else if (this.currentSymbol) {
            if (isSymbolTerminator(char)) {
                if (isNumeric(this.currentSymbol.name)) {
                    convertSymbolToNumber(this.currentSymbol);
                }

                this.currentSymbol = null;
            }

            else if (isLegalSymbolChar(char)) {
                this.currentSymbol.name += char;
            }

            else {
                this.errorState = "Invalid character in Symbol '" + char +
                    "' at buffer position " + this.parsePosition;
            }
        }

        else if (char === '(') {
            var newList = List.cons();

            this._storeNewCell(newList);
            this.inProcessLists.push(newList);
            this.parseDepth++;
        }

        else if (char === ')') {
            if (this.inProcessLists.length === 0) {
                this.errorState = "Unbalanced List - Found close ')' without matching open '(' at buffer position " +
                    this.parsePosition;
            }
            else {
                this.inProcessLists.pop();
                this.parseDepth--;
            }
        }

        else if (char === '"') {
            // Create a new string to build
            var newString = List.string();

            this._storeNewCell(newString);
            this.currentString = newString;
        }

        else if (isLegalSymbolChar(char)) {
            var newSymbol = List.symbol(char);

            this._storeNewCell(newSymbol);
            this.currentSymbol = newSymbol;
        }

        else if (isWhitespace(char)) {
            // ignore whitespace outside of strings
        }

        else {
            // this is a catch all of characters we don't know how to parse yet
            this.errorState = "Unexpected character '" + char + "' at " + this.parsePosition;
        }

        this.parsePosition++;
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
    parser.addString(string);
    var state = parser.parseState();
    if (state.error) {
        throw new ParseError(state.error);
    }
    if (!state.incomplete) {
        throw new ParseError("Parser.parse only handles balanced list segments");
    }
    var lists = parser.getLists();
    if (lists.length !== 1) {
        throw new ParseError("Parser.parse only supports single lists");
    }
    return lists[0];
};

module.exports = Parser;
