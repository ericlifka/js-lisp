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

function stackTop(stack) {
    return stack[stack.length - 1];
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
                !this.currentParseString &&         // There should not be an in progress string
                this.stringQueue.length === 0 &&    // There should not be any pending strings
                this.inProcessLists.length === 0)   // All lists should be closed
        };
    },
    getLists: function () {
        return this.lists;
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
        this.currentSymbol = null;
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
        // TODO: backslashes should be handled in a forward looking manner
        // TODO: instead of backward looking because currently escaping
        // TODO: an escape character does not work, such as "\\"
        if (this._isStringTerminator()) {

            // non-escaped quote character ends the current string
            this.currentString = null;
        }
        else {
            this.currentString.value += this.currentChar;
        }
    },
    _parseStep_InSymbol: function () {
        if (isSymbolTerminator(this.currentChar)) {
            this._parseStep_EndCurrentSymbol();
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
    _parseStep_StartNewList: function () {
        var newList = List.cons();

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
    _parseStep_EndCurrentList: function () {
        if (this.inProcessLists.length === 0) {
            this.errorState = "Unbalanced List - Found close ')' without " +
                "matching open '(' at buffer position " +
                this.parsePosition;
        }
        else {
            this.inProcessLists.pop();
        }
    },
    _parseStep_EndCurrentSymbol: function () {
        // Rather than try to parse numbers differently, we can allow
        // all numeric characters in symbols and then check at the end
        // of the symbol if it could be read as a number instead. This
        // simplifies parsing because we don't have to guess the type
        // number and then convert back to symbol if parsing fails.
        if (isNumeric(this.currentSymbol.name)) {
            convertSymbolToNumber(this.currentSymbol);
        }

        this.currentSymbol = null;
    },
    _storeNewCell: function (cell) {
        if (this.inProcessLists.length === 0) {
            this.lists.push(cell);
        } else {
            List.addToEnd(stackTop(this.inProcessLists), cell);
        }
    },
    _isStringTerminator: function () {
        if (this.currentChar !== '"') {
            return false;
        }
        var count = 0;
        var position = this.parsePosition - 1;
        while (this.currentParseString[position] === '\\') {
            count++;
            position--;
        }

        if (count > 0) {
            // An even number of backslashes means that they escape each other
            // and do not effect the quote. An odd number means that the one
            // at the end escapes the quote and the string does not end.
            return count % 2 === 0;
        }
        else {
            // The quote character is not escaped, so the string should end
            return true;
        }
    }
};

Parser.parse = function (string) {
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
    var lists = parser.getLists();
    if (lists.length === 0) {
        throw new ParseError("Parser.parse no lists found");
    }
    if (lists.length !== 1) {
        throw new ParseError("Parser.parse only supports single lists");
    }
    return lists[0];
};

module.exports = Parser;
