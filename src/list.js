var ListError = require('./error').ListError;

function Cell(type) {
    this.type = type;
}

Cell.prototype.toString = function () {
    if (this.type === 'cons') {
        return "(" + printList(this) + ")";
    }

    if (this.type === 'symbol') {
        return this.name;
    }

    if (this.type === 'string') {
        return '"' + this.value + '"';
    }

    return "[Object Cell]";
};

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

function string() {
    var string = new Cell('string');
    string.value = "";
    return string;
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

function printList(list) {
    var curr = "";
    if (list.car) {
        curr += list.car;
    }

    if (!list.cdr) {
        return curr;
    }

    return curr + " " + printList(list.cdr);
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
    string: string,
    isTrueCons: isTrueCons,
    isCons: isCons,
    addToEnd: addToEnd
};
