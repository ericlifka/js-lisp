
var should = require('should');
var list = require('../src/list');

describe('list', function () {
    describe('cons', function () {
        it('should create an empty list', function (){
            var li = list.cons();
            li.should.be.an.instanceOf(Object);
            (li.car === undefined).should.be.ok;
            (li.cdr === undefined).should.be.ok;
        });

        it('should store the value in the car', function () {
            var li = list.cons(5);
            li.car.should.be.exactly(5);
            (li.cdr === undefined).should.be.ok;
        });
    });
});
