should = require('should')

parse = require('../src/parse')
{toString} = require('../src/list')
{isCons} = require('../src/list')
{ParseError} = require('../src/error')

describe.skip 'parse', ->
    it 'should return null for bad input', ->
        (parse() is null).should.be.ok
        (parse("") is null).should.be.ok
        (parse({}) is null).should.be.ok
        (parse(5) is null).should.be.ok

    it 'should return a cons cell list', ->
        isCons(parse("()")).should.be.ok

    it 'should parse a simple list', ->
        list = parse("(1 2 3)")
        toString(list).should.equal("(1 2 3)")

    it 'should support nested lists', ->
        list = parse("(1 (2 3) 4)")
        toString(list).should.equal("(1 (2 3) 4)")

    it 'should reject symbols outside of lists', ->
        should(-> parse("2")).throw(ParseError)

    it 'should reject unclosed lists', ->
        should(-> parse("(1 2")).throw(ParseError)
