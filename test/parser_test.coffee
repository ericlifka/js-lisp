should = require('should')

Parser = require('../src/parser')
List = require('../src/list')
{ParseError} = require('../src/error')

describe.only 'parser', ->
    it 'should error on bad input', ->
        should(-> Parser.parse()).throw(ParseError)
        should(-> Parser.parse("")).throw(ParseError)
        should(-> Parser.parse({})).throw(ParseError)
        should(-> Parser.parse(5)).throw(ParseError)

    it 'should return a cons cell list', ->
        List.isCons(Parser.parse("()")).should.be.ok

    it 'should parse a simple list', ->
        list = Parser.parse("(1 2 3)")
        list.toString().should.equal("(1 2 3)")

    it 'should support nested lists', ->
        list = Parser.parse("(1 (2 3) 4)")
        list.toString().should.equal("(1 (2 3) 4)")

    it 'should reject symbols outside of lists', ->
        should(-> Parser.parse("2")).throw(ParseError)

    it 'should reject unclosed lists', ->
        should(-> Parser.parse("(1 2")).throw(ParseError)
