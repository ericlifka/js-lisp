var ParseError = require('./error').ParseError;
var List = require('./list');

function Parser() {
    this.stringQueue = [];
    this.lists = [];
    this.currentParseString = null;
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

        while (this.parsePosition < this.currentParseString.length) {
            this._parseStep();
        }
    },
    _parseStep: function () {
        var char = this.currentParseString[this.parsePosition];
        if (char === '(') {

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
