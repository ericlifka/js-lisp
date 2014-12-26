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

function processLine(line, completeCB, incompleteCB, errorCB) {
    PARSER.parseString(line);
    var state = PARSER.parseState();
    var lists = PARSER.getLists();
    callback(lists);
}

function printResult(result) {
    console.log("" + result);
}

function main() {
    INPUT.on('line', function (line) {
        if (line === "(quit)") {
            INPUT.close();
            return;
        }

        processLine(                        // EVAL
            line,
            GLOBAL_ENVIRONMENT,
            function (result) {
                printResult(result);        // PRINT
                INPUT.prompt();             // REPEAT
            });
    });

    INPUT.prompt();                         // READ
}

if (!module.parent) {
    main();
} else {
    module.exports = {
        processLine: processLine,
        printResult: printResult
    };
}
