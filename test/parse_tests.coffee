parse = require('../src/parse')

describe 'parse', ->
    it 'should return null for bad input', ->
        (parse() is null).should.be.ok
        (parse("") is null).should.be.ok
        (parse({}) is null).should.be.ok
        (parse(5) is null).should.be.ok
