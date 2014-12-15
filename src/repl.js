var readline = require('readline');

function main() {
    var inputInterface = readline.createInterface(process.stdin, process.stdout);
    inputInterface.setPrompt('js-lisp> ');
    inputInterface.prompt();
    inputInterface.on('line', function (line) {
        if (line === "(quit)") {
            inputInterface.close();
        }
        else {
            inputInterface.prompt();
        }
    }).on('close', function () {
        process.exit(0);
    });
}

main();
