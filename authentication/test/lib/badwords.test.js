const assert = require('assert');
const expect = require('chai').expect;
const request = require('supertest');
const badwords = require('../../lib/badwords');


describe("badwords", function() {
    it("should not detect bad words with safe ones", async function() {
        expect(await badwords.check("name")).to.equal(false);
        //expect(await badwords.check("blass")).to.equal(false);
        expect(await badwords.check("checker")).to.equal(false);
    });

    it ("should detect bad words", async function(){
        expect(await badwords.check("fuck")).to.equal(true);
        expect(await badwords.check("toofuck")).to.equal(true);
        expect(await badwords.check("a55")).to.equal(true);
    });
});