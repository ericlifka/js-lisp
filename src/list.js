var ListError = require('./error').ListError;

function Cell(type) {
    this.type = type;
}

function cons(car, cdr) {
    var c = new Cell('cons');
    c.car = car;
    c.cdr = cdr;
    return c;
}

function symbol() {
    var symbol = new Cell('symbol');
    symbol.name = "";
    return symbol;
}

function isTrueCons(cell) {
    return cell instanceof Cell &&
        cell.type === 'cons';
}

function isCons(cell) {
    return cell && cell.hasOwnProperty &&
        cell.hasOwnProperty('car') &&
        cell.hasOwnProperty('cdr');
}

function toString_recur(cell) {
    if (!cell) {
        return "";
    }

    if (!isCons(cell)) {
        throw new ListError("Given non cons cell to print");
    }

    if (!cell.car) {
        return "";
    }

    var current;

    if (isCons(cell.car)) { // handle sub-lists
        current = toString(cell.car);
    } else {
        current = "" + cell.car;
    }

    if (cell.cdr) {
        return current + " " + toString_recur(cell.cdr);
    } else {
        return current;
    }
}

function toString(list) {
    return "(" + toString_recur(list) + ")";
}

function addToEnd(list, cell) {
    if (!isCons(list)) {
        throw new ListError("Cannot add Cell '" + cell + "' to non list '" + list + "'");
    }

    var current = list;

    while (!!current.cdr) {
        current = current.cdr;
    }

    current.cdr = cons(cell);

    return list;
}

module.exports = {
    cons: cons,
    symbol: symbol,
    isTrueCons: isTrueCons,
    isCons: isCons,
    toString: toString,
    addToEnd: addToEnd
};
