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

    // Input structure:  (def-fn name (...arguments) ...body)
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
    })
};
