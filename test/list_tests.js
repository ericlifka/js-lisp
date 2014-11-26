
var should = require('should');
var list = require('../src/list');

describe('list', function(){
    describe('cons', function(){
        it('should return an object', function(){
            list.cons().should.be.an.instanceOf(Object);
        });
    });
});
