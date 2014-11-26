/*
Parse lists of the form
(sym sym sym)
into linked lists made up of cons sells
*/

var list = require('./list');

function nullCheck(input) {
    return !(
        input &&
        (typeof input === "string") &&
        input.length > 0
    );
}

function parse(input) {
    if (nullCheck(input)) {
        return null;
    }

    var head = list.cons();



    return head;
}

module.exports = parse;
