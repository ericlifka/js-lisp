var Environment = require('./environment');
var List = require('./list');
var Readline = require('readline');
var Parser = require('./parser');

var PARSER = new Parser();
var GLOBAL_ENVIRONMENT = Environment.create();
var INPUT = Readline.createInterface(process.stdin, process.stdout);
var NEW_STATEMENT_PROMPT = 'js-lisp> ';
var CONTINUE_STATEMENT_PROMPT = "> ";

INPUT.setPrompt(NEW_STATEMENT_PROMPT);
INPUT.on('close', function () {
    console.log("terminating js-lisp REPL");
    process.exit(0);
});

function processLine(line, errorCB, incompleteCB, completeCB) {
    PARSER.parseString(line);
    var state = PARSER.parseState();
    var lists = PARSER.getLists();
    callback(lists);
}

function printResult(result) {
    console.log("" + result);
}

function parseError(parserState) {
    console.log("ParseError: " + parserState.error);
}

function resetParser() {

}

function main() {
    INPUT.on('line', function (line) {
        if (line === "(quit)") {
            INPUT.close();
            return;
        }

        processLine(
            line,
            function errorCB(parserState) {
                parseError(parserState);
                resetParser();
                INPUT.setPrompt(NEW_STATEMENT_PROMPT);
                INPUT.prompt();
            },
            function incompleteCB() {
                INPUT.setPrompt(CONTINUE_STATEMENT_PROMPT);
                INPUT.prompt();
            },
            function completeCB(result) {
                printResult(result);

                resetParser();
                INPUT.setPrompt(NEW_STATEMENT_PROMPT);
                INPUT.prompt();
            });
    });

    INPUT.prompt();
}

if (!module.parent) {
    main();
} else {
    module.exports = {
        processLine: processLine,
        printResult: printResult
    };
}
