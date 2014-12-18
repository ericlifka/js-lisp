var Environment = require('./environment');
var List = require('./list');
var readline = require('readline');
var parse = require('./parse');

var inputInterface = readline.createInterface(process.stdin, process.stdout);
inputInterface.setPrompt('js-lisp> ');
inputInterface.on('close', function () {
    console.log("terminating js-lisp REPL");
    process.exit(0);
});

function processLine(line, environment, callback) {
    var list = parse(line);
    if (typeof callback === 'function') {
        callback(list);
    }
}

function printResult(evalResult) {
    if (List.isCons(evalResult)) {
        console.log(List.toString(evalResult));
    } else {
        console.log(evalResult);
    }
}

function main() {
    var globalEnvironment = Environment.create();

    inputInterface.on('line', function (line) {
        if (line === "(quit)") {
            inputInterface.close();
            return;
        }

        processLine(                        // EVAL
            line,
            globalEnvironment,
            function (result) {
                printResult(result);        // PRINT
                inputInterface.prompt();    // REPEAT
            }
        );
    });

    inputInterface.prompt();                // READ
}

if (!module.parent) {
    main();
} else {
    module.exports = {
        processLine: processLine,
        printResult: printResult
    };
}
