var Readline = require('readline');
var fs = require('fs');

var Environment = require('./environment');
var TopLevel = require('./top-level');
var Parser = require('./parser');
var Eval = require('./eval');

var PARSER = new Parser();
var TOP_LEVEL = TopLevel.create();
var GLOBAL_ENVIRONMENT = Environment.create({parent: TOP_LEVEL});
var INPUT = Readline.createInterface(process.stdin, process.stdout);
var NEW_STATEMENT_PROMPT = 'js-lisp> ';
var CONTINUE_STATEMENT_PROMPT = "> ";

INPUT.setPrompt(NEW_STATEMENT_PROMPT);
INPUT.on('close', function () {
    console.log("terminating js-lisp REPL");
    process.exit(0);
});
INPUT.on('line', function (line) {
    if (line === "(quit)") {
        INPUT.close();
    }
    else {
        parseInput(line);
    }
});

if (!module.parent) {
    main();
}

function main() {
    fs.readFile('src/stdlib.jsl', {encoding: 'utf8'}, function (err, data) {
        if (err) return console.error(data);

        PARSER.parseString(data);
        var state = PARSER.parseState();
        if (state.error) return console.error("Error in StdLib: " + state.error);

        PARSER.getStatements().forEach(function (statement) {
            Eval.evaluateStatement(statement, GLOBAL_ENVIRONMENT);
        });

        PARSER.reset();
        INPUT.prompt();
    });
}

function parseInput(line) {
    PARSER.parseString(line);
    var state = PARSER.parseState();

    if (state.error) {
        parseError(state.error);

        PARSER.reset();
        INPUT.setPrompt(NEW_STATEMENT_PROMPT);
    }
    else if (!state.complete) {
        INPUT.setPrompt(CONTINUE_STATEMENT_PROMPT);
    }
    else {
        evaluateInput(PARSER.getStatements());

        PARSER.reset();
        INPUT.setPrompt(NEW_STATEMENT_PROMPT);
    }

    INPUT.prompt();
}

function evaluateInput(statements) {
    var i, result;
    for (i = 0; i < statements.length; i++) {
        result = Eval.evaluateStatement(statements[i], GLOBAL_ENVIRONMENT);
        printResult(result);
    }
}

function printResult(result) {
    console.log("" + result);
}

function parseError(error) {
    console.log("ParseError: " + error);
}
