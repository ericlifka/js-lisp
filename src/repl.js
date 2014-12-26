var Environment = require('./environment');
var List = require('./list');
var Readline = require('readline');
var Parser = require('./parser');

var PARSER = new Parser();
var GLOBAL_ENVIRONMENT = Environment.create();
var INPUT = Readline.createInterface(process.stdin, process.stdout);

INPUT.setPrompt('js-lisp> ');
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

function parseError(errorState) {
    console.log("ParseError: " + errorState.error);
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
            },
            function incompleteCB() {

            },
            function completeCB(result) {
                printResult(result);
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
