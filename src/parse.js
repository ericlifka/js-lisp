/*
Parse lists of the form
(sym sym sym)
into linked lists made up of cons sells
*/

var list = require('./list');
var ParseError = require('./error').ParseError;

function nullCheck(input) {
    return !(
        input &&
        (typeof input === "string") &&
        input.length > 0
    );
}

function isWhitespace(char) {
    return /\s/.test(char);
}

function isOpenChar(char) {
    return /\(/.test(char);
}

function isCloseChar(char) {
    return /\)/.test(char);
}

function parse(inputBuffer, currentPosition) {
    var bufferLength, consHead, consCurrent, currentSymbol, currentChar, whitespaceChar, closeChar, closedList;

    if (nullCheck(inputBuffer)) {
        return null;
    }

    closedList = true;
    consHead = null;
    consCurrent = null;
    bufferLength = inputBuffer.length;
    currentPosition = currentPosition || 0;

    while (currentPosition < bufferLength) {
        currentChar = inputBuffer[currentPosition];
        currentPosition++;

        whitespaceChar = isWhitespace(currentChar);
        closeChar = isCloseChar(currentChar);

        if (whitespaceChar || closeChar) {
            if (currentSymbol) {
                if (!consCurrent.car) {
                    consCurrent.car = currentSymbol;
                } else {
                    consCurrent.cdr = list.cons(currentSymbol);
                    consCurrent = consCurrent.cdr;
                }

                currentSymbol = null;
            }

            if (closeChar) {
                closedList = true;
                break;
            } else {
                continue;
            }
        }

        if (isOpenChar(currentChar)) {
            if (consHead) {
                throw new ParseError('Nested lists not supported');
            }

            closedList = false;
            consHead = list.cons();
            consCurrent = consHead;

            continue;
        }

        if (!consHead) {
            throw new ParseError('Symbol encountered before list started');
        }

        if (currentSymbol) {
            currentSymbol += currentChar;
        } else {
            currentSymbol = "" + currentChar;
        }
    }

    if (!closedList) {
        throw new ParseError("List wasn't closed before end of input buffer");
    }

    return consHead;
}

module.exports = parse;
