var ListError = require('./error').ListError;

function Cell(type) {
    this.type = type;
}

Cell.prototype.toString = function () {
    switch(this.type) {
        case 'cons': return "(" + printList(this) + ")";
        case 'symbol': return this.name;
        case 'string': return '"' + this.value + '"';
        case 'error': return 'Error: "' + this.message + '"';
        case 'number': return "" + this.value;
        default: return "[object Cell]";
    }
};

Cell.prototype.length = function () {
    if (this.type !== 'cons') {
        return NaN;
    }

    if (!this.car) {
        return 0;
    }

    var length = 0;
    var iterator = this;
    while (iterator) {
        length += 1;
        iterator = iterator.cdr;
    }
    return length;
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

function error(message) {
    var err = new Cell('error');
    err.message = arguments.length === 0 ? "" : ""+message;
    return err;
}

function isCons(cell) {
    return cell && cell.hasOwnProperty &&
        cell.hasOwnProperty('car') &&
        cell.hasOwnProperty('cdr');
}

function isType(cell, type) {
    return cell instanceof Cell &&
        cell.type === type;
}

function isTrueCons(cell) {
    return isType(cell, 'cons');
}

function isError(cell) {
    return isType(cell, 'error');
}

function isNumber(cell) {
    return isType(cell, 'number');
}

function isValidEntity(cell) {
    return cell &&
        cell instanceof Cell &&
        !!cell.type;
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

    if (list.car === undefined && list.cdr === undefined) {
        // An empty cons represents an empty list so the item should go in the car
        list.car = cell;
        return;
    }

    var current = list;
    while (current.cdr) {
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
    error: error,
    isTrueCons: isTrueCons,
    isCons: isCons,
    isError: isError,
    isNumber: isNumber,
    isValidEntity: isValidEntity,
    addToEnd: addToEnd
};
