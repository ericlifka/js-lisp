var ParseError = require('./error').ParseError;
var List = require('./list');

function isWhitespace(char) {
    return /\s/.test(char);
}

function isSymbolTerminator(char) {
    return isWhitespace(char) || char === ')' || char === ']';
}

function isLegalSymbolChar(char) {
    return /[a-zA-Z\d_|?:!@#$%^&*<>=+.\/\-\\]/.test(char);
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

function convertListToArray(list) {
    var arr = [];
    var ptr = list;
    if (!list.car && !list.cdr) {
        return arr;
    }

    while (ptr) {
        arr.push(ptr.car);
        ptr = ptr.cdr;
    }

    list.type = 'array';
    delete list.car;
    delete list.cdr;
    list.value = arr;
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
                this.lookAheadChar = this.currentParseString[this.parsePosition + 1];

                this._parseStep();
                if (this.errorState) {
                    return;
                }
                this._nextChar();
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
    _nextChar: function () {
        this.parsePosition++;
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

        else if (this.currentChar === "'") {
            this._parseStep_Quote('quote');
        }

        else if (this.currentChar === "`") {
            this._parseStep_Quote('quasi-quote');
        }

        else if (this.currentChar === ",") {
            if (this.lookAheadChar === "@") {
                this._parseStep_Quote('unquote-splice');
                this._nextChar();
            }
            else {
                this._parseStep_Quote('unquote');
            }
        }

        else if (this.currentChar === '[') {
            this._parseStep_StartNewList('array');
        }

        else if (this.currentChar === '(') {
            this._parseStep_StartNewList('list');
        }

        else if (this.currentChar === ']') {
            this._parseStep_EndCurrentList('array');
        }

        else if (this.currentChar === ')') {
            this._parseStep_EndCurrentList('list');
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
            this.currentString = null;
            this._closeQuoteLists();
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
    _parseStep_Quote: function (quoteSymbol) {
        var quoteList = List.cons(List.symbol(quoteSymbol));
        quoteList.isQuoteList = true;

        this._storeNewCell(quoteList);
        this.inProcessLists.push(quoteList);
    },
    _parseStep_StartNewList: function (type) {
        var newList = List.cons();
        newList.parseType = type;

        this._storeNewCell(newList);
        this.inProcessLists.push(newList);
    },
    _parseStep_StartNewString: function () {
        var newString = List.string();

        this._storeNewCell(newString);
        this.currentString = newString;
    },
    _parseStep_StartNewSymbol: function () {
        var newSymbol = List.symbol(this.currentChar);

        this._storeNewCell(newSymbol);
        this.currentSymbol = newSymbol;
    },
    _parseStep_EndCurrentList: function (type) {
        if (this.inProcessLists.length === 0) {
            this.errorState = "Unbalanced List - Found closing character without " +
                "matching opening character at buffer position " +
                this.parsePosition;

            return;
        }

        var structure = this.inProcessLists.pop();

        if (structure.parseType !== type) {
            this.errorState = "Mismatched data structure types, opened as '" +
                structure.parseType + "' but closed as '" + type + "'";

            return;
        }

        if (type === 'array') {
            convertListToArray(structure);
        }

        delete structure.parseType;
        this._closeQuoteLists();
    },
    _closeQuoteLists: function () {
        // Close off every quoteList that's a direct parent in the process stack
        var current = stackTop(this.inProcessLists);
        while (current && current.isQuoteList) {
            // isQuoteList is parser only data that shouldn't leak to the larger environment
            delete current.isQuoteList;

            this.inProcessLists.pop();
            current = stackTop(this.inProcessLists);
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

            this.currentSymbol = null;
            this._closeQuoteLists();
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
