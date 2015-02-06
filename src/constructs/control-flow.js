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
    }),

    "map": List.func(function (parameters) {
        if (!parameters || parameters.length() < 2) {
            return List.error("map - expected form `(map fn-value list-value)`");
        }

        var lambda = parameters.car;
        var list = parameters.cdr.car;

        if (!List.isFunc(lambda)) {
            return List.error("map - first parameter must be function expression");
        }

        if (!List.isCons(list)) {
            return List.error("map - second parameter must be a list");
        }

        var listPtr = list;
        var resultList = List.cons();
        var item, value;

        while (listPtr) {
            item = listPtr.car;

            value = lambda.callable(List.cons(item));
            List.addToEnd(resultList, value);

            listPtr = listPtr.cdr;
        }

        return resultList;
    })
};
