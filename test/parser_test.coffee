should = require('should')

Parser = require('../src/parser')
List = require('../src/list')
{ParseError} = require('../src/error')

describe 'parser', ->
    it 'should error on bad input', ->
        should(-> Parser.parse()).throw(ParseError)
        should(-> Parser.parse("")).throw(ParseError)
        should(-> Parser.parse({})).throw(ParseError)
        should(-> Parser.parse(5)).throw(ParseError)

    it 'should return a cons cell list', ->
        List.isTrueCons(Parser.parse("()")).should.be.ok

    it 'should parse a simple list', ->
        list = Parser.parse("(1 2 3)")
        list.toString().should.equal("(1 2 3)")

    it 'should support nested lists', ->
        list = Parser.parse("(1 (2 3) 4)")
        list.toString().should.equal("(1 (2 3) 4)")

    it 'should parse tokens outside of lists', ->
        Parser.parse('someToken').toString().should.equal('someToken')
        Parser.parse('532').toString().should.equal('532')
        Parser.parse('"something goin on"').toString().should.equal('"something goin on"')

    it 'should reject unclosed lists', ->
        should(-> Parser.parse("(1 2")).throw(ParseError)
        should(-> Parser.parse("(1 (2)")).throw(ParseError)

    it 'should support lists across parse strings', ->
        p = new Parser()
        p.parseString "(1 2"
        p.parseString "  3 4)"
        state = p.parseState()
        should(state.error).be.not.ok
        should(state.complete).be.ok
        lists = p.getLists()
        should(lists.length).equal(1)

    it 'should support non nested lists', ->
        p = new Parser()
        p.parseString "(1) (a)(3)"
        should(p.getLists().length).equal(3)
