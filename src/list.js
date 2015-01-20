var ListError = require('./error').ListError;

function Cell(type) {
    this.type = type;
}

Cell.prototype.toString = function () {
    switch (this.type) {
        case 'cons':
            return "(" + printList(this) + ")";
        case 'symbol':
            return this.name;
        case 'string':
            return '"' + this.value + '"';
        case 'error':
            return 'Error: "' + this.message + '"';
        case 'number':
            return "" + this.value;
        case 'null':
            return "nil";
        case 'function':
            return "[cell function]";
        case 'macro':
            return "[cell macro]";
        case 'special':
            return "[cell special-form]";
        default:
            return "[object Cell]";
    }
};

Cell.prototype.clone = function (target) {
    if (target) {
        // Reset supplied cell
        delete target.type;
        delete target.car;
        delete target.cdr;
        delete target.name;
        delete target.value;
        delete target.message;
        delete target.callable;

        target.type = this.type;
    }
    else {
        target = new Cell(this.type);
    }

    switch (this.type) {
        case 'cons':
            target.car = this.car && this.car.clone ? this.car.clone() : this.car;
            target.cdr = this.cdr && this.cdr.clone ? this.cdr.clone() : this.cdr;
            break;
        case 'symbol':
            target.name = this.name;
            break;
        case 'string':
        case 'number':
            target.value = this.value;
            break;
        case 'error':
            target.message = this.message;
            break;
        case 'special':
        case 'function':
        case 'macro':
            //TODO: these should probably store their parameters and bodies on the object so they can be cloned too
            target.callable = this.callable;
            break;
        case 'null':
        default:
            break;
    }

    return target;
};

Cell.prototype.cloneInto = Cell.prototype.clone; // synonym for clarity

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
    symbol.name = arguments.length === 0 ? "" : "" + name;
    return symbol;
}

function string(value) {
    var string = new Cell('string');
    string.value = arguments.length === 0 ? "" : "" + value;
    return string;
}

function number(value) {
    var number = new Cell('number');
    number.value = arguments.length === 0 ? 0 : +value;
    return number;
}

function special(fn) {
    var cell = new Cell('special');
    cell.callable = fn;
    return cell;
}

function func(fn) {
    var cell = new Cell('function');
    cell.callable = fn;
    return cell;
}

function macro(fn) {
    var cell = new Cell('macro');
    cell.callable = fn;
    return cell;
}

function nullValue() {
    return new Cell('null');
}

function error(message) {
    var err = new Cell('error');
    err.message = arguments.length === 0 ? "" : "" + message;
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

function isFunc(cell) {
    return isType(cell, 'function');
}

function isSpecial(cell) {
    return isType(cell, 'special');
}

function isMacro(cell) {
    return isType(cell, 'macro');
}

function isNull(cell) {
    return isType(cell, 'null');
}

function isValidEntity(cell) {
    return cell &&
        cell instanceof Cell && !!cell.type;
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
    func: func,
    special: special,
    macro: macro,
    nullValue: nullValue,
    error: error,
    isTrueCons: isTrueCons,
    isCons: isCons,
    isFunc: isFunc,
    isSpecial: isSpecial,
    isMacro: isMacro,
    isError: isError,
    isNumber: isNumber,
    isNull: isNull,
    isValidEntity: isValidEntity,
    addToEnd: addToEnd
};
