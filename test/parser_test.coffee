should = require('should')

Parser = require('../src/parser')
{toString} = require('../src/list')
{isCons} = require('../src/list')
{ParseError} = require('../src/error')

describe.only 'parser', ->
    it 'should return null for bad input', ->
        (Parser.parse() is null).should.be.ok
        (Parser.parse("") is null).should.be.ok
        (Parser.parse({}) is null).should.be.ok
        (Parser.parse(5) is null).should.be.ok

    it 'should return a cons cell list', ->
        isCons(Parser.parse("()")).should.be.ok

    it 'should parse a simple list', ->
        list = Parser.parse("(1 2 3)")
        toString(list).should.equal("(1 2 3)")

    it 'should support nested lists', ->
        list = Parser.parse("(1 (2 3) 4)")
        toString(list).should.equal("(1 (2 3) 4)")

    it 'should reject symbols outside of lists', ->
        should(-> Parser.parse("2")).throw(ParseError)

    it 'should reject unclosed lists', ->
        should(-> Parser.parse("(1 2")).throw(ParseError)
