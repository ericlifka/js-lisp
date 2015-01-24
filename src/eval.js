var List = require('./list');

function evaluateStatement(statement, environment) {
    if (!List.isValidEntity(statement)) {
        return List.error("Eval on non-valid entity");
    }

    switch (statement.type) {
        case 'cons':
            return evaluateList(statement, environment);

        case 'symbol':
            return evaluateSymbol(statement, environment);

        case 'function':
        case 'macro':
        case 'special':
        case 'error':
        case 'string':
        case 'number':
        case 'null':
            return statement;

        default:
            return List.error("Unrecognized type '" + statement.type + "' for evaluation object '" + statement + "'");
    }
}

function evaluateSymbol(symbol, environment) {
    var value = environment.getSymbolValue(symbol.name);

    return value ?
        value :
        List.error('No value found for symbol "' + symbol.name + '"');
}

function evaluateList(list, environment) {

    // The empty list evaluates to itself
    if (list.length() === 0) {
        return list;
    }

    var firstStatement = list.car;
    var parameters = list.cdr;

    var callable = evaluateStatement(firstStatement, environment);

    if (List.isError(callable)) {
        return callable;
    }

    if (List.isSpecial(callable)) {
        return callable.callable(environment, parameters);
    }

    if (List.isMacro(callable)) {
        var macroResult = callable.callable(parameters);
        return evaluateStatement(macroResult, environment);
    }

    if (List.isFunc(callable)) {
        var evaluatedParameters = evaluateParameters(parameters, environment);

        if (List.isError(evaluatedParameters)) {
            return evaluatedParameters;
        }

        return callable.callable(evaluatedParameters);
    }

    return List.error("Found non invokable value as first statement of s-expression: " + callable);
}

function evaluateParameters(parameters, environment) {
    if (!parameters) {
        return parameters;
    }

    var evaluated = List.cons();
    var current = parameters;
    var resultValue;

    while (current) {
        resultValue = evaluateStatement(current.car, environment);

        if (List.isError(resultValue)) {
            return resultValue;
        }

        List.addToEnd(evaluated, resultValue);
        current = current.cdr;
    }

    return evaluated;
}

module.exports = {
    evaluateStatement: evaluateStatement,
    evaluateList: evaluateList,
    evaluateParameters: evaluateParameters
};
