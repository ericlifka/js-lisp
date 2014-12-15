var readline = require('readline');
var inputInterface = readline.createInterface(process.stdin, process.stdout);
inputInterface.setPrompt('js-lisp> ');
inputInterface.on('close', function () {
    console.log("terminating js-lisp REPL");
    process.exit(0);
});

function processLine(inputLine) {
    console.log("input-line: ", inputLine);
}

function printResult(evalResult) {
    console.log(evalResult);
}

function main() {
    inputInterface.on('line', function (line) {
        if (line === "(quit)") {
            inputInterface.close();
            return;
        }

        var result = processLine(line); // EVAL
        printResult(result);            // PRINT
        inputInterface.prompt();        // REPEAT
    });

    inputInterface.prompt();            // READ
}

main();
