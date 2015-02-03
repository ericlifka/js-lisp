var ListError = require('./error').ListError;

function Cell(type) {
    this.type = type;
}

Cell.prototype.toString = function () {
    switch (this.type) {
        case 'cons':
            return "(" + printList(this) + ")";

        case 'array':
            return "" + this.value;

        case 'symbol':
            return this.name;

        case 'string':
            return '"' + this.value + '"';

        case 'error':
            return 'Error: "' + this.message + '"';

        case 'number':
        case 'boolean':
            return "" + this.value;

        case 'null':
            return "null";

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
        case 'boolean':
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

function boolean(bool) {
    var boolean = new Cell('boolean');
    boolean.value = bool;
    return boolean;
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

function isSymbol(cell) {
    return isType(cell, 'symbol');
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

function isBoolean(cell) {
    return isType(cell, 'boolean');
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

function createList() {
    if (arguments.length === 0) {
        return null;
    }

    var list = cons(arguments[0]);
    var current = list;
    for (var i = 1; i < arguments.length; i++) {
        current.cdr = cons(arguments[i]);
        current = current.cdr;
    }

    return list;
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

function cellToBool(cell) {
    if (!cell) {
        return false;
    }

    switch (cell.type) {
        case 'cons':
            return cell.car && cell.cdr;

        case 'symbol':
            return cell.name;

        case 'error':
            return cell.message;

        case 'string':
        case 'number':
        case 'boolean':
            return cell.value;

        case 'null':
            return null;

        case 'function':
        case 'macro':
        case 'special':
            return cell.callable;

        default:
            return false;
    }
}

function compareLists(a, b, comparisonFn) {
    if (a.length() !== b.length()) {
        return false;
    }


    while (a && b) {

        if (a.car && b.car) {
            if (!compareCells(a.car, b.car, comparisonFn)) {
                return false;
            }
        }
        // This monstrosity checks if one but not both items are null
        else if (!a.car || !b.car) {
            if (a.car || b.car) {
                return false;
            }
        }

        a = a.cdr;
        b = b.cdr;
    }

    return true;
}

function compareCells(a, b, comparisonFn) {
    if (a.type !== b.type) {
        return false;
    }

    switch(a.type) {
        case 'cons':
            return compareLists(a, b, comparisonFn);

        case 'symbol':
            return comparisonFn(a.name, b.name);

        case 'error':
            return comparisonFn(a.message, b.message);

        case 'string':
        case 'number':
        case 'boolean':
            return comparisonFn(a.value, b.value);

        case 'null':
            return comparisonFn(null, null);

        case 'function':
        case 'macro':
        case 'special':
            return comparisonFn(a.callable, b.callable);

        default:
            return false;
    }
}

module.exports = {
    cons: cons,
    symbol: symbol,
    string: string,
    number: number,
    boolean: boolean,
    func: func,
    special: special,
    macro: macro,
    nullValue: nullValue,
    error: error,
    isTrueCons: isTrueCons,
    isCons: isCons,
    isSymbol: isSymbol,
    isFunc: isFunc,
    isSpecial: isSpecial,
    isMacro: isMacro,
    isError: isError,
    isNumber: isNumber,
    isBoolean: isBoolean,
    isNull: isNull,
    isValidEntity: isValidEntity,
    createList: createList,
    cellToBool: cellToBool,
    compareCells: compareCells,
    addToEnd: addToEnd
};
