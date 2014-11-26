list = require('../src/list')

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

    it 'should prepend the new cell to the supplied list', ->
        li_first = list.cons(1)
        li_second = list.cons(2, li_first)
        li_second.car.should.be.exactly(2)
        li_second.cdr.should.be.an.instanceOf(Object)
        li_second.cdr.car.should.be.exactly(1)


describe 'isCons', ->
    it 'should accept an empty cell', ->
        list.isCons(list.cons()).should.be.ok

    it 'should accept a populated cell', ->
        list.isCons(list.cons(2, list.cons(1))).should.be.ok

    it 'should accept duck-typed cells', ->
        list.isCons({car:true,cdr:true}).should.be.ok

    it 'should reject incomplete duck-typing', ->
        list.isCons({car:true}).should.not.be.ok
        list.isCons({cdr:true}).should.not.be.ok
