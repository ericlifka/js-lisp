/*
Parse lists of the form
(sym sym sym)
into linked lists made up of cons sells
*/

var list = require('./list');

function nullCheck(input) {
    return !input || input.length === 0;
}

function parse(input) {
    if (nullCheck(input)) {
        return list.cons();
    }

    var head = list.cons();



    return head;
}