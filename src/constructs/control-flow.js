var List = require('./../list');
var Eval = require('./../eval');

module.exports = {
    "if": List.special(function (scopeEnvironment, list) {
        if (!list || list.length < 2) {
            return List.error("if - invalid structure, expected (if booleanStatement trueStatement ?falseStatement");
        }

        var boolStatement = list.car;
        var trueStatement = list.cdr.car;
        var falseStatement = (list.length() >= 3) ? list.cdr.cdr.car : List.nullValue();

        var boolValue = Eval.evaluateStatement(boolStatement, scopeEnvironment);

        var chosenStatement = List.cellToBool(boolValue) ? trueStatement : falseStatement;
        return Eval.evaluateStatement(chosenStatement, scopeEnvironment);
    }),

    "while": List.special(function (scopeEnvironment, list) {
        if (!list || list.length < 1) {
            return List.error("while - invalid structure, expected (while booleanStatement ...body?)");
        }

        var boolStatement = list.car;
        var bodyStatements = list.cdr;
        var result = List.nullValue();
        var boolStatementResult, currentBody, currentBodyStatement;

        while (true) {
            boolStatementResult = Eval.evaluateStatement(boolStatement, scopeEnvironment);
            if (!List.cellToBool(boolStatementResult)) {
                break;
            }

            currentBody = bodyStatements;
            while (currentBody) {
                currentBodyStatement = currentBody.car;

                result = Eval.evaluateStatement(currentBodyStatement, scopeEnvironment);

                currentBody = currentBody.cdr;
            }
        }

        return result;
    })
};
