var Environment = require('./environment');
var List = require('./list');
var Readline = require('readline');
var Parser = require('./parser');

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

function processLine(line, errorCB, incompleteCB, completeCB) {
    PARSER.parseString(line);
    var state = PARSER.parseState();

    if (state.error) {
        errorCB(state.error);
    }
    else if (!state.complete) {
        incompleteCB();
    }
    else {
        var statements = PARSER.getStatements();
        completeCB(statements);
    }
}

function evalStatement(statement, environment, callback) {
    if (!List.isValidEntity(statement)) {
        return callback(null, "Eval on non-valid entity");
    }

    switch (statement.type) {
        case 'cons':
            evalList(statement, environment, callback);
            break;

        case 'symbol':
            var value = environment.getSymbolValue(statement.name);
            if (value) {
                callback(value);
            }
            else {
                callback(null, 'No value found for symbol "' + statement.name + '"');
            }
            break;

        case 'string':
        case 'number':
            callback(statement);
            break;

        default:
            callback(null, "Unrecognized type '" + statement.type + "' for evaluation object '" + statement + "'");
            break;
    }
}

function evalList(list, environment, callback) {
    // The empty list evaluates to itself
    if (list.length() === 0) {
        return callback(list);
    }

    var functionSymbol = list.car;
    var parameters = list.cdr;

    if (functionSymbol.type !== 'symbol') {
        return callback(null, "Cannot call '" + functionSymbol + "'");
    }

    var functionValue = environment.getSymbolValue(functionSymbol.name);

    var result = null;
    if (typeof functionValue === 'function') {
        try {
            result = functionValue(parameters);
        }
        catch (error) {
            return callback(null, "Error evaluating function '" + functionSymbol.name + "': '" + error.message + "'");
        }
    }
    else if (functionValue && functionValue.type === 'function') {
        return callback(null, "Custom functions not supported yet");
    }
    else {
        return callback(null, "Cannot invoke non function value '" + functionValue + "'");
    }

    return callback(result);
}

function printResult(result) {
    console.log("" + result);
}

function parseError(error) {
    console.log("ParseError: " + error);
}

function evaluationError(error) {
    console.log("EvaluationError: " + error);
}

function resetPrompt() {
    PARSER.reset();
    INPUT.setPrompt(NEW_STATEMENT_PROMPT);
}

function main() {
    INPUT.on('line', function (line) {
        if (line === "(quit)") {
            INPUT.close();
            return;
        }

        processLine(
            line,
            function errorCB(error) {
                parseError(error);

                resetPrompt();
                INPUT.prompt();
            },
            function incompleteCB() {
                INPUT.setPrompt(CONTINUE_STATEMENT_PROMPT);
                INPUT.prompt();
            },
            function completeCB(statements) {
                var current = 0;
                var total = statements.length;
                var evalNext = function () {
                    if (current >= total) {
                        resetPrompt();
                        INPUT.prompt();
                        return;
                    }

                    evalStatement(statements[current], GLOBAL_ENVIRONMENT, function (evalResult, error) {
                        if (error) {
                            evaluationError(error);
                        }
                        else {
                            printResult(evalResult);
                            current += 1;
                        }
                        evalNext();
                    });
                };

                evalNext();
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
