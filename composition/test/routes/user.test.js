const assert = require('assert');
const expect = require('chai').expect;
const request = require('supertest');
const sinon = require("sinon");
const app = require('../../app');
const sigUtil = require('eth-sig-util');
const settings = require('config').get('api');
const db = require('../../lib/db');

describe("testing /user route", function() {
    var recoverPersonalSignature;
    before(function(){
        recoverPersonalSignature = sinon.stub(sigUtil, "recoverPersonalSignature").returns("walletaddress");
    });
    after(function(){
        recoverPersonalSignature.restore();
    });
    afterEach(async function(){
        // delete the user from db so next test will run
        try {
            await db.deleteUser({walletAddress:"walletaddress"});
        } catch (e) {
            // don't care if we fail to delete
        }
    });

    describe("no user", function() {
        it("should have /login method return 400 fail", function(){
            return request(app)
                .post('/user/login')
                .set({"Origin":settings["access_control"]})
                .send({
                    from: "walletaddress",
                    result: "0x8f404ccb12177042879dd11370712b27c6feb65bbb2e514a6fbbfc0d8b58f3240da2a3ff8e6b542355dd9a556007b96bc85badf7e1f691df3f9f3205c70ab7cd1c",
                    msg: "0x5465726d73206f66205573653a20205265676973746572696e67"
                })
                .then(function(response){
                    //console.log(response);
                    expect(response.status).to.equal(400);
                    expect(response.body.error.extraInfo[0]).to.contains("Cannot find user");
                });
        });

        it("should have /register create a new user", function() {
            return request(app)
                .post('/user/register')
                .set({"Origin":settings["access_control"]})
                .send({
                    from: "walletaddress",
                    result: "0x8f404ccb12177042879dd11370712b27c6feb65bbb2e514a6fbbfc0d8b58f3240da2a3ff8e6b542355dd9a556007b96bc85badf7e1f691df3f9f3205c70ab7cd1c",
                    msg: "0x5465726d73206f66205573653a20205265676973746572696e67",
                    nickname: "nickname",
                    email: "email@email.com"
                })
                .then(function(response){
                    expect(response.status).to.equal(200);
                });
        });
    });

    describe("success - has user", function() {
        var sessionToken;
        beforeEach(function(){
            return request(app)
                .post('/user/register')
                .set({"Origin":settings["access_control"]})
                .send({
                    from: "walletaddress",
                    result: "0x8f404ccb12177042879dd11370712b27c6feb65bbb2e514a6fbbfc0d8b58f3240da2a3ff8e6b542355dd9a556007b96bc85badf7e1f691df3f9f3205c70ab7cd1c",
                    msg: "0x5465726d73206f66205573653a20205265676973746572696e67",
                    nickname: "nickname",
                    email: "email@email.com"
                })
                .then(function(response){
                    expect(response.status).to.equal(200);
                    sessionToken = response.body.data.token;
                });
        });

        it("/login method should return 200 ", function(){
            return request(app)
                .post('/user/login')
                .set({"Origin":settings["access_control"]})
                .send({
                    from: "walletaddress",
                    result: "0x8f404ccb12177042879dd11370712b27c6feb65bbb2e514a6fbbfc0d8b58f3240da2a3ff8e6b542355dd9a556007b96bc85badf7e1f691df3f9f3205c70ab7cd1c",
                    msg: "0x5465726d73206f66205573653a20205265676973746572696e67"
                })
                .then(function(response){
                    //console.log(response);
                    expect(response.status).to.equal(200);
                    console.log(response.body);
                    expect(response.body).to.contains({ response: "ok"});
                });
        });

        it("/ base return should return 200", function(){
            return request(app)
                .get("/user")
                .set({"Origin":settings["access_control"]})
                .set('Cookie', ['sessionToken=' + sessionToken])
                .send({
                })
                .then(function (response) {
                    expect(response.status).to.equal(200);
                    console.log(response.body);
                })
        });
    });
})