var ListError = require('./error').ListError;

function cons(car, cdr) {
    return {
        car: car,
        cdr: cdr
    };
}

function isCons(cell) {
    return cell instanceof Object &&
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

module.exports = {
    cons: cons,
    isCons: isCons,
    toString: toString
};
