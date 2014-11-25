/*
Parse lists of the form
(sym sym sym)
into linked lists made up of objects like
{
    car: sym
    cdr: list*
}
 */

function cons(car, cdr) {
    return {
        car: car,
        cdr: cdr
    };
}

function parse(input) {
    if (!input || input.length === 0) {
        return cons();
    }

    var head = cons();

    return head;
}