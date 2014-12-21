var ListError = require('./error').ListError;

function Cell(type) {
    this.type = type;
}

Cell.prototype.toString = function () {
    switch(this.type) {
        case 'cons': return "(" + printList(this) + ")";
        case 'symbol': return this.name;
        case 'string': return '"' + this.value + '"';
        case 'number': return "" + this.value;
        default: return "[object Cell]";
    }
};

function cons(car, cdr) {
    var c = new Cell('cons');
    c.car = car;
    c.cdr = cdr;
    return c;
}

function symbol(name) {
    var symbol = new Cell('symbol');
    symbol.name = arguments.length === 0 ? "" : ""+name;
    return symbol;
}

function string(value) {
    var string = new Cell('string');
    string.value = arguments.length === 0 ? "" : ""+value;
    return string;
}

function number(value) {
    var number = new Cell('number');
    number.value = arguments.length === 0 ? 0 : +value;
    return number;
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
    number: number,
    isTrueCons: isTrueCons,
    isCons: isCons,
    addToEnd: addToEnd
};
