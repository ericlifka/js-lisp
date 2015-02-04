var List = require('./../list');
var Eval = require('./../eval');


function isUnquoteList(list) {
    return list &&
        list.car &&
        list.car.type === 'symbol' &&
        list.car.name === 'unquote';
}

function isSpliceList(list) {
    return list &&
        list.car &&
        list.car.type === 'symbol' &&
        list.car.name === 'unquote-splice';
}

function spliceInto(resultList, context) {
    // Save a reference to the items that come after the context item
    var rest = context.cdr;

    // Replace the context cell with the resultList, effectively inserting the result items
    resultList.cloneInto(context);

    // Find the end of the result list
    while (context.cdr) {
        context = context.cdr;
    }

    // Append the saved items to the end of the result list, finishing the in place splice
    context.cdr = rest;
}

module.exports = {
    "quote": List.special(function (scopeEnvironment, list) {
        if (!list || !list.car) {
            return List.nullValue();
        }
        else {
            return list.car;
        }
    }),

    "quasi-quote": List.special(function (scopeEnvironment, list) {
        if (!list) {
            return List.nullValue();
        }

        var structure = list.clone();

        var queue = [structure];
        var queueList = function (list) {
            while (list) {
                queue.push(list);
                list = list.cdr;
            }
        };

        var evalResult, context, item;

        while (queue.length > 0) {

            context = queue.shift();
            item = context.car;

            if (!List.isCons(item)) {
                continue;
            }

            if (isUnquoteList(item)) {
                evalResult = Eval.evaluateStatement(item, scopeEnvironment);
                evalResult.cloneInto(item);
                continue;
            }

            if (isSpliceList(item)) {
                evalResult = Eval.evaluateStatement(item, scopeEnvironment);
                if (List.isCons(evalResult)) {
                    spliceInto(evalResult, context)
                }
                else {
                    evalResult.cloneInto(item);
                }
                continue;
            }

            queueList(item);
        }

        return structure.car;
    }),

    "unquote": List.special(function (scopeEnvironment, list) {
        if (!list || !list.car) {
            return List.nullValue();
        }

        return Eval.evaluateStatement(list.car, scopeEnvironment);
    }),

    "unquote-splice": List.special(function (scopeEnvironment, list) {
        if (!list || !list.car) {
            return List.nullValue();
        }

        return Eval.evaluateStatement(list.car, scopeEnvironment);
    })
};
