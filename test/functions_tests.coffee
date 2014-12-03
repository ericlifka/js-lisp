should = require('should')

parse = require('../src/parse')
converters = require('../src/converters')

describe 'functions', ->
    it 'should convert an empty list to null', ->
        converters.fn(parse("()")).should.equal("null")

    it 'should convert a list to a function call', ->
        converters.fn(parse("(sym 1 2)"))
            .should.equal("sym(1, 2)")
