/*
Parse lists of the form
(sym sym sym)
into linked lists made up of objects like
{
    car: sym
    cdr: list*
}
 */


function nullCheck(input) {
    return !input || input.length === 0;
}

function parse(input) {
    if (nullCheck(input)) {
        return cons();
    }

    var head = cons();



    return head;
}