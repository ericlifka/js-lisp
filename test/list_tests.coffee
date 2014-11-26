list = require('../src/list')

describe 'list', ->
    describe 'cons', ->
        it 'should create an empty list', ->
            li = list.cons()
            li.should.be.an.instanceOf(Object)
            (li.car is undefined).should.be.ok
            (li.cdr is undefined).should.be.ok

        it 'should store the value in the car', ->
            li = list.cons(5)
            li.car.should.be.exactly(5)
            (li.cdr is undefined).should.be.ok
