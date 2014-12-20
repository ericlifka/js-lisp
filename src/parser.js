var ParseError = require('./error').ParseError;
var List = require('./list');

function isWhitespace(char) {
    return /\s/.test(char);
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
            error: null,
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

        if (char === '(') {
            var newList = List.cons();

            if (this.parseDepth === 0) {
                this.lists.push(newList);
            }
            else {
                List.addToEnd(this.inProcessLists[0], newList);
            }

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
            if (this.currentString) {
                // If there is a string being built then close it
                this.currentString = null;
            } else {
                // Create a new string to build

            }
        }

        else if (isWhitespace(char)) {
            if (this.currentSymbol) {
                this.currentSymbol = null;
            }

            if (this.currentString) {
                this.currentString.value += char;
            }
        }


        this.parsePosition++;
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
