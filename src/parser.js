var ParseError = require('./error').ParseError;

function Parser() {

}

Parser.prototype = {
    addString: function (string) {

    },
    parseState: function () {

    },
    getLists: function () {

    }
};

Parser.parse = function (string) {
    var parser = new Parser();
    parser.addString(string);
    var state = parser.parseState();
    if (state.error) {
        throw new ParseError(state.error);
    }
    var lists = parser.getLists();
    if (lists.length !== 1) {
        throw new ParseError("Parser.parse only supports single lists");
    }
    return lists[0];
};

module.exports = {
    Parser: Parser
};
