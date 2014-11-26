parse = require('../src/parse')
{isCons} = require('../src/list')

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

    it 'should support nested lists'

    it 'should reject symbols outside of lists'