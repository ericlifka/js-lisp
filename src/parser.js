var ParseError = require('./error').ParseError;
var List = require('./list');

function isWhitespace(char) {
    return /\s/.test(char);
}

function isSymbolTerminator(char) {
    return isWhitespace(char) || char === ')';
}

function isLegalSymbolChar(char) {
    return /[a-zA-Z\d_|?:!@#$%^&*<>=+.\/\-\\]/.test(char);
}

function isQuoteChar(char) {
    return char === "'" || char === "`";
}

function isNumeric(symbol) {
    return symbol && symbol.length > 0 && !isNaN(symbol);
}

function stackTop(stack) {
    return stack[stack.length - 1];
}

function convertSymbolToNumber(cell) {
    cell.value = +cell.name;
    cell.type = 'number';
    delete cell.name;
}

function quoteStatement(cell) {

}

var ESCAPE_MAP = {
    "b": "\b",
    "f": "\f",
    "n": "\n",
    "r": "\r",
    "t": "\t",
    "v": "\v",
    "0": "\0"
};
function escapeChar(char) {
    return ESCAPE_MAP[char] || char;
}

function Parser() {
    this.reset();
}

Parser.prototype = {
    parseString: function (/* strings... */) {
        for (var i = 0, length = arguments.length; i < length; i++) {
            var str = arguments[i];
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
                !this.currentParseString &&         // There should not be an in progress string
                this.stringQueue.length === 0 &&    // There should not be any pending strings
                this.inProcessLists.length === 0)   // All lists should be closed
        };
    },
    getStatements: function () {
        return this.statements;
    },
    reset: function () {
        this.stringQueue = [];
        this.statements = [];
        this.inProcessLists = [];
        this.currentParseString = null;
        this.currentSymbol = null;
        this.currentString = null;
        this.escapeNext = false;
        this.parsePosition = 0;
        this.errorState = null;
    },

    _processQueue: function () {
        if (this.errorState) {
            return;
        }

        while (this.stringQueue.length > 0) {
            this._startNextString();

            while (this.parsePosition < this.currentParseString.length) {
                this.currentChar = this.currentParseString[this.parsePosition];
                this._parseStep();
                if (this.errorState) {
                    return;
                }
                this.parsePosition++;
            }

            this._clearCurrentString();
        }
    },
    _startNextString: function () {
        if (!this.currentParseString) {
            this.currentParseString = this.stringQueue.pop();
            this.parsePosition = 0;
        }
    },
    _clearCurrentString: function () {
        this.currentParseString = null;
        this._endCurrentSymbol();
        this.parsePosition = 0;
    },
    _parseStep: function () {
        if (this.currentString) {
            this._parseStep_InString();
        }

        else if (this.currentSymbol) {
            this._parseStep_InSymbol();

            if (this.currentChar === ')') {
                this._parseStep_EndCurrentList();
            }
        }

        else if (isQuoteChar(this.currentChar)) {
            this._parseStep_Quote();
        }

        else if (this.currentChar === '(') {
            this._parseStep_StartNewList();
        }

        else if (this.currentChar === ')') {
            this._parseStep_EndCurrentList();
        }

        else if (this.currentChar === '"') {
            this._parseStep_StartNewString();
        }

        else if (isLegalSymbolChar(this.currentChar)) {
            this._parseStep_StartNewSymbol();
        }

        else if (isWhitespace(this.currentChar)) {
            // ignore whitespace outside of strings and symbols
        }

        else {
            // this is a catch all of characters we don't know how to parse yet
            this.errorState = "Unexpected character '" + this.currentChar + "' at " + this.parsePosition;
        }
    },
    _parseStep_InString: function () {
        if (this.escapeNext) {
            this.currentString.value += escapeChar(this.currentChar);
            this.escapeNext = false;
        }
        else if (this.currentChar === '"') {
            if (this.currentString.quoted) {
                quoteStatement(this.currentString);
            }

            this.currentString = null;
        }
        else if (this.currentChar === '\\') {
            this.escapeNext = true;
        }
        else {
            this.currentString.value += this.currentChar;
        }
    },
    _parseStep_InSymbol: function () {
        if (isSymbolTerminator(this.currentChar)) {
            this._endCurrentSymbol();
        }

        else if (isLegalSymbolChar(this.currentChar)) {
            this.currentSymbol.name += this.currentChar;
        }

        else {
            this.errorState = "Invalid character in Symbol '" +
                this.currentChar +
                "' at buffer position " +
                this.parsePosition;
        }
    },
    _parseStep_Quote: function () {
        this.quoteNext = true;
    },
    _parseStep_StartNewList: function () {
        var newList = List.cons();

        this._checkForQuoted(newList);
        this._storeNewCell(newList);
        this.inProcessLists.push(newList);
    },
    _parseStep_StartNewString: function () {
        var newString = List.string();

        this._checkForQuoted(newString);
        this._storeNewCell(newString);
        this.currentString = newString;
    },
    _parseStep_StartNewSymbol: function () {
        var newSymbol = List.symbol(this.currentChar);

        this._checkForQuoted(newSymbol);
        this._storeNewCell(newSymbol);
        this.currentSymbol = newSymbol;
    },
    _parseStep_EndCurrentList: function () {
        if (this.inProcessLists.length === 0) {
            this.errorState = "Unbalanced List - Found close ')' without " +
                "matching open '(' at buffer position " +
                this.parsePosition;
        }
        else {
            var list = this.inProcessLists.pop();
            if (list.quoted) {
                quoteStatement(list);
            }
        }
    },
    _checkForQuoted: function (newCell) {
        if (this.quoteNext) {
            newCell.quoted = true;
            this.quoteNext = false;
        }
    },
    _endCurrentSymbol: function () {
        if (this.currentSymbol) {
            // Rather than try to parse numbers differently, we can allow
            // all numeric characters in symbols and then check at the end
            // of the symbol if it could be read as a number instead. This
            // simplifies parsing because we don't have to guess the type
            // number and then convert back to symbol if parsing fails.
            if (isNumeric(this.currentSymbol.name)) {
                // Numbers evaluate to themselves already, so quoted numbers are just numbers
                convertSymbolToNumber(this.currentSymbol);
            }

            if (this.currentSymbol.quoted) {
                quoteStatement(this.currentSymbol);
            }

            this.currentSymbol = null;

        }
    },
    _storeNewCell: function (cell) {
        if (this.inProcessLists.length === 0) {
            this.statements.push(cell);
        } else {
            List.addToEnd(stackTop(this.inProcessLists), cell);
        }
    }
};

function parse(string) {
    if (!string) {
        throw new ParseError("Parser.parse no input supplied");
    }
    var parser = new Parser();
    parser.parseString(string);
    var state = parser.parseState();
    if (state.error) {
        throw new ParseError(state.error);
    }
    if (!state.complete) {
        throw new ParseError("Parser.parse only handles balanced list segments");
    }
    var statements = parser.getStatements();
    if (statements.length === 0) {
        throw new ParseError("Parser.parse no lists found");
    }
    if (statements.length !== 1) {
        throw new ParseError("Parser.parse only supports single lists");
    }
    return statements[0];
}

module.exports = Parser;
module.exports.parse = parse;
module.exports._escapeChar = escapeChar;
