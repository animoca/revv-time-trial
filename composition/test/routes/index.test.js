const assert = require('assert');
const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../app');


describe("testing / route", function() {
    it("should return failure 401", function(){
        return request(app)
            .get('/')
            .then(function(response) {
               expect(response.status).to.equal(401);
            });
    });
    it("should return success 200 ok", function(){
        return request(app)
            .get('/ping')
            .then(function(response) {
                expect(response.status).to.equal(200);
                assert(response.ok);
                expect(response.text).to.contains("pong")
            });
    });
});
;