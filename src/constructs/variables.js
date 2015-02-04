var List = require('./../list');
var Eval = require('./../eval');
var Environment = require('./../environment');

module.exports = {
    "def": List.special(function (scopeEnvironment, list) {
        if (scopeEnvironment.readOnly) {
            return List.error("def - tried to set value in a read only environment");
        }
        if (!list || list.length() !== 2) {
            return List.error("def - takes exactly 2 arguments, a symbol and a value: `(def a 2)`");
        }

        var symbol = list.car;
        var statement = list.cdr.car;

        if (!symbol || !symbol.name) {
            return List.error("Symbol given to def must be valid");
        }
        else if (!statement) {
            return List.error("Statement given to def must be valid");
        }

        var resultValue = Eval.evaluateStatement(statement, scopeEnvironment);
        scopeEnvironment.putSymbolValue(symbol.name, resultValue);
        return resultValue;
    }),

    "set": List.special(function (scopeEnvironment, list) {
        if (!list || list.length() !== 2) {
            return List.error("set - takes exactly 2 arguments, a symbol and a value: `(set a 2)`");
        }

        var symbol = list.car;
        var statement = list.cdr.car;

        if (!symbol || !symbol.name) {
            return List.error("set - symbol not valid");
        }
        else if (!statement) {
            return List.error("set - statement not valid");
        }

        var env = scopeEnvironment;
        while (env) {
            if (env.hasSymbolValue(symbol)) {
                if (env.readOnly) {
                    return List.error("set - symbol '" + symbol + "' is defined in a read only environment");
                }
                var resultValue = Eval.evaluateStatement(statement, scopeEnvironment);
                env.putSymbolValue(symbol, resultValue);

                return resultValue;
            }

            env = env.parent;
        }

        return List.error("set - symbol not defined in environment chain");
    }),

    "let": List.special(function (scopeEnvironment, list) {
        if (!list || list.length() < 1) {
            return List.error("let - invalid structure expected `(let (...assignment pairs) ...statements?)`");
        }

        var assignments = list.car;
        var statements = list.cdr;

        if (!List.isCons(assignments)) {
            return List.error("let - second parameter to let must be a list");
        }

        var localLetScope = Environment.create({parent: scopeEnvironment});

        if (assignments) { // The empty list is a valid let form

            if (assignments.length() % 2 !== 0) {
                return List.error("let - imbalanced assignments list, must be matched pairs");
            }

            var assignmentPtr = assignments;
            var symbol, expression, expressionResult;

            while (assignmentPtr) {
                symbol = assignmentPtr.car;
                expression = assignmentPtr.cdr.car;

                if (!List.isSymbol(symbol)) {
                    return List.error("let - found non symbol in symbol position: '" + symbol + "'");
                }

                expressionResult = Eval.evaluateStatement(expression, localLetScope);
                localLetScope.putSymbolValue(symbol, expressionResult);

                assignmentPtr = assignmentPtr.cdr.cdr; // jump forward two positions at a time
            }
        }

        var statementsPtr = statements;
        var result = List.nullValue();
        var statement;

        while (statementsPtr) {
            statement = statementsPtr.car;

            result = Eval.evaluateStatement(statement, localLetScope);

            statementsPtr = statementsPtr.cdr;
        }

        return result;
    })
};
