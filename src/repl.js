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

        evaluateStatement(statements[current], GLOBAL_ENVIRONMENT, function (evalResult) {
            printResult(evalResult);
            current += 1;
            next();
        });
    };

    next();
}

function evaluateStatement(statement, environment, callback) {
    if (!List.isValidEntity(statement)) {
        return callback(List.error("Eval on non-valid entity"));
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
                callback(List.error('No value found for symbol "' + statement.name + '"'));
            }
            break;

        case 'error':
        case 'string':
        case 'number':
            callback(statement);
            break;

        default:
            callback(List.error("Unrecognized type '" + statement.type + "' for evaluation object '" + statement + "'"));
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
        return callback(List.error("Cannot call '" + functionSymbol + "'"));
    }

    var functionValue = environment.getSymbolValue(functionSymbol.name);

    if (typeof functionValue !== 'function') {
        return callback(List.error("Cannot invoke non function value '" + functionValue + "'"));
    }

    evaluateParameters(parameters, environment, function (evaluatedParameters) {
        // If any of the parameters resolve as an error then the whole statement is resolved as that error
        if (List.isError(evaluatedParameters)) {
            return callback(evaluatedParameters);
        }

        functionValue(evaluatedParameters, callback);
    });
}

function evaluateParameters(parameters, environment, callback) {
    if (!parameters) {
        return callback(parameters);
    }

    var evaluated = List.cons();
    var current = parameters;
    var next = function () {
        if (!current) {
            return callback(evaluated);
        }

        evaluateStatement(current.car, environment, function (resultValue) {
            // If any parameter resolves to an error then we can stop evaluating immediately
            if (List.isError(resultValue)) {
                return callback(resultValue);
            }

            List.addToEnd(evaluated, resultValue);
            current = current.cdr;
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
