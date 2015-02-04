var List = require('./../list');
var Eval = require('./../eval');
var Environment = require('./../environment');

function createCallable(scopeEnvironment, list) {
    if (!list || list.length() < 2) {
        return List.error("Invalid lambda, must be of the form `(fn (...arguments) ...body)`");
    }

    var formals = list.car;
    var body = list.cdr;
    var arity = formals.length();

    if (!List.isCons(formals)) {
        return List.error("Invalid lambda, first argument must be a list");
    }

    return function (parameters) {
        var paramsSupplied = parameters ? parameters.length() : 0;
        if (arity !== paramsSupplied) {
            return List.error("Function defined with arity " +
                arity + " but supplied " + paramsSupplied + " parameters");
        }

        var invocationEnvironment = Environment.create({parent: scopeEnvironment});
        var formal = formals;
        var parameter = parameters;

        while (formal && parameter) {
            invocationEnvironment.putSymbolValue(formal.car.name, parameter.car);

            formal = formal.cdr;
            parameter = parameter.cdr;
        }

        var statement;
        var result;
        var currentStatement = body;
        while (currentStatement) {
            statement = currentStatement.car;
            currentStatement = currentStatement.cdr;

            result = Eval.evaluateStatement(statement, invocationEnvironment);
        }

        return result || List.nullValue();
    };
}

function defTransform(list, callableSymbol) {
    if (!list || list.length() < 3) {
        return List.error("expected form (def-fn symbol (...arguments) ...body)");
    }

    // Input structure:  (def-macro name (...arguments) ...body)
    // Output structure: (def name (fn (...arguments) ...body))
    var def = List.symbol("def");
    var macroSym = List.symbol(callableSymbol);
    var name = list.car;
    var macroDef = list.cdr;

    return List.createList(
        def,
        name,
        List.cons(macroSym, macroDef)
    );
}

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

    "fn": List.special(function (scopeEnvironment, list) {
        return List.func(createCallable(scopeEnvironment, list));
    }),

    "macro": List.special(function (scopeEnvironment, list) {
        return List.macro(createCallable(scopeEnvironment, list));
    }),

    "def-fn": List.macro(function (list) {
        return defTransform(list, "fn");
    }),

    "def-macro": List.macro(function (list) {
        return defTransform(list, "macro");
    }),

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
