should = require('should')

parse = require('../src/parse')
{isCons} = require('../src/list')
{ParseError} = require('../src/error')

describe 'parse', ->
    it 'should return null for bad input', ->
        (parse() is null).should.be.ok
        (parse("") is null).should.be.ok
        (parse({}) is null).should.be.ok
        (parse(5) is null).should.be.ok

    it 'should return a cons cell list', ->
        isCons(parse("()")).should.be.ok

    it 'should parse a simple list', ->
        list = parse("(1 2 3)")
        isCons(list).should.be.ok
        isCons(list.cdr).should.be.ok
        isCons(list.cdr.cdr).should.be.ok
        list.car.should.be.exactly('1')
        list.cdr.car.should.be.exactly('2')
        list.cdr.cdr.car.should.be.exactly('3')

    it.only 'should support nested lists', ->
        list = parse("(1 (2 3) 4)")
        isCons(list).should.be.ok
        isCons(list.cdr.car).should.be.ok
        list.cdr.car.car.should.be.exactly('2')
        list.cdr.car.cdr.car.should.be.exactly('3')

    it 'should reject symbols outside of lists', ->
        should(-> parse("2")).throw(ParseError)

    it 'should reject unclosed lists', ->
        should(-> parse("(1 2")).throw(ParseError)
