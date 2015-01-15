var Environment = require('./environment');
var Readline = require('readline');
var Parser = require('./parser');
var Eval = require('./eval');

var PARSER = new Parser();
var GLOBAL_ENVIRONMENT = Environment.createTopLevel();
var INPUT = Readline.createInterface(process.stdin, process.stdout);
var NEW_STATEMENT_PROMPT = 'js-lisp> ';
var CONTINUE_STATEMENT_PROMPT = "> ";

INPUT.setPrompt(NEW_STATEMENT_PROMPT);
INPUT.on('close', function () {
    console.log("terminating js-lisp REPL");
    process.exit(0);
});

function parseInput(line) {
    PARSER.parseString(line);
    var state = PARSER.parseState();

    if (state.error) {
        parseError(state.error);

        PARSER.reset();
        INPUT.setPrompt(NEW_STATEMENT_PROMPT);
        INPUT.prompt();
    }
    else if (!state.complete) {
        INPUT.setPrompt(CONTINUE_STATEMENT_PROMPT);
        INPUT.prompt();
    }
    else {
        evaluateInput(PARSER.getStatements(), function () {
            PARSER.reset();
            INPUT.setPrompt(NEW_STATEMENT_PROMPT);
            INPUT.prompt();
        });
    }
}

function evaluateInput(statements, callback) {
    var current = 0;
    var total = statements.length;
    var next = function () {
        if (current >= total) {
            return callback();
        }

        Eval.evaluateStatement(statements[current], GLOBAL_ENVIRONMENT, function (evalResult) {
            printResult(evalResult);
            current += 1;
            next();
        });
    };

    next();
}

function printResult(result) {
    console.log("" + result);
}

function parseError(error) {
    console.log("ParseError: " + error);
}

function main() {
    INPUT.on('line', function (line) {
        if (line === "(quit)") {
            INPUT.close();
            return;
        }

        parseInput(line);
    });

    INPUT.prompt();
}

if (!module.parent) {
    main();
} else {
    module.exports = {
        processLine: parseInput,
        printResult: printResult
    };
}
