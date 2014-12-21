should = require('should')

list = require('../src/list')
{ListError} = require('../src/error')

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

        it 'should prepend the new cell to the supplied list', ->
            li_first = list.cons(1)
            li_second = list.cons(2, li_first)
            li_second.car.should.be.exactly(2)
            list.isCons(li_second.cdr).should.be.ok


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

    describe 'toString', ->
        it 'should represent empty list as ()', ->
            list.cons().toString().should.equal("()")

        it 'should represent simple list as (1 2 3)', ->
            cons = list.cons
            cons(1, cons(2, cons(3))).toString().should.equal("(1 2 3)")

        it 'should represent nested list as (1 (2 3) 4)', ->
            cons = list.cons
            cons(1, cons(cons(2, cons(3)), cons(4))).toString().should.equal("(1 (2 3) 4)")

        it 'should use builtin toString of objects', ->
            list.cons({toString:->"abc"}).toString().should.equal("(abc)")

        it 'should support symbols', ->
            list.symbol(":sym").toString().should.equal(":sym")

