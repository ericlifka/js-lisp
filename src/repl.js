var Environment = require('./environment');
var readline = require('readline');
var parse = require('./parse');

var inputInterface = readline.createInterface(process.stdin, process.stdout);
inputInterface.setPrompt('js-lisp> ');
inputInterface.on('close', function () {
    console.log("terminating js-lisp REPL");
    process.exit(0);
});

function processLine(line, environment) {
    var list = parse(line);
    return list;
}

function printResult(evalResult) {
    console.log(evalResult);
}

function main() {
    var globalEnvironment = Environment.create();

    inputInterface.on('line', function (line) {
        if (line === "(quit)") {
            inputInterface.close();
            return;
        }

        var result = processLine(       // EVAL
                        line,
                        globalEnvironment);

        printResult(result);            // PRINT
        inputInterface.prompt();        // REPEAT
    });

    inputInterface.prompt();            // READ
}

main();
