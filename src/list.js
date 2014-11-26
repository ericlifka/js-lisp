
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

module.exports = {
    cons: cons,
    isCons: isCons
};
