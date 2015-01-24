var List = require('./list');

function evaluateStatement(statement, environment, callback) {
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
            return statement;

        default:
            return List.error("Unrecognized type '" + statement.type + "' for evaluation object '" + statement + "'");
    }
}

function evaluateSymbol(symbol, environment, callback) {
    var value = environment.getSymbolValue(symbol.name);
    if (value) {
        callback(value);
    }
    else {
        callback(List.error('No value found for symbol "' + symbol.name + '"'));
    }
}


function evaluateList(list, environment, callback) {
    // The empty list evaluates to itself
    if (list.length() === 0) {
        return callback(list);
    }

    var firstStatement = list.car;
    var parameters = list.cdr;

    evaluateStatement(firstStatement, environment, function (callableResult) {
        if (List.isError(callableResult)) {
            return callback(callableResult);
        }

        if (List.isSpecial(callableResult)) {
            return callableResult.callable(environment, parameters, callback);
        }

        if (List.isMacro(callableResult)) {
            return callableResult.callable(parameters, function (resultStatement) {
                evaluateStatement(resultStatement, environment, callback);
            });
        }

        if (List.isFunc(callableResult)) {
            return evaluateParameters(parameters, environment, function (evaluatedParameters) {
                if (List.isError(evaluatedParameters)) {
                    return callback(evaluatedParameters);
                }

                callableResult.callable(evaluatedParameters, callback);
            });
        }

        callback(List.error("Found non invokable value as first statement of s-expression: " + callableResult));
    });
}

function evaluateParameters(parameters, environment, callback) {
    if (!parameters) {
        return callback(parameters);
    }

    var evaluated = List.cons();
    var current = parameters;
    var next = function () {
        if (!current) {
            return callback(evaluated);
        }

        evaluateStatement(current.car, environment, function (resultValue) {
            // If any parameter resolves to an error then we can stop evaluating immediately
            if (List.isError(resultValue)) {
                return callback(resultValue);
            }

            List.addToEnd(evaluated, resultValue);
            current = current.cdr;
            next();
        });
    };

    next();
}

module.exports = {
    evaluateStatement: evaluateStatement,
    evaluateList: evaluateList,
    evaluateParameters: evaluateParameters
};
