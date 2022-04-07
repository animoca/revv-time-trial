import chai,{expect} from 'chai';
import {CorsHandler} from "../src/corsHandler";
import {AppBootstrapError, CorsOriginNotAccepeted} from "../src/error";
import { logger } from '../src/logger';

chai.should();

describe("Cors Test", () => {
    
    let conf = ["AAA.com", "BBB.com", { regex : ".*\.domain\.com"}];
    let handler;
    beforeEach(async function() {
        handler = new CorsHandler(conf);
    });

    it("CorsHandler should throw if the configuration is not an array", () => {
        expect(() => new CorsHandler({})).to.throw(AppBootstrapError)
    });

    const regexWithHttpConf = [{regex: "http://aaa.com"},{regex : "http[s]?:\/\/localhost:[0-9]{4}"}];
    describe(`CorsHandler with config ${JSON.stringify(regexWithHttpConf)}`,() => {
        const handler = new CorsHandler(regexWithHttpConf);
        it("should able to allow http://localhost:3000", () => {
            expect(handler.checkOrigin("http://localhost:3000")).to.true;
        })

        it("should able to allow https://localhost:3000", () => {
            expect(handler.checkOrigin("https://localhost:3000")).to.true;
        });

        it("should able to allow undefined or null", () => {
            expect(handler.checkOrigin(undefined)).to.true;
            expect(handler.checkOrigin(null)).to.true;
        });
    } );

    describe(`CorsHandler with config ${JSON.stringify(conf)}`,() => {

        it("should able to setup with right amount of validators", () => {
            handler.should.have.property('validators').with.lengthOf(3);
        });

        it("should able to allow exactly AAA.com, BBB.com", () => {
            expect(handler.checkOrigin("AAA.com")).to.true;
            expect(handler.checkOrigin("BBB.com")).to.true;
        });

        it("should able to reject b.AAA.com", () => {
            expect(handler.checkOrigin("b.AAA.com")).to.false;
        });
        

        it("should able to reject notvalid.com", () => {
            expect(handler.checkOrigin("notvalid.com")).to.false;
        });

        it("should able to allow *.domain.com", () => {
            expect(handler.checkOrigin("a.domain.com")).to.true;
            expect(handler.checkOrigin("b.domain.com")).to.true;
        });

        describe("getCorsOptions", () => {
            let options;
                
            beforeEach(() => {
                options = handler.getCorsOption();
            });

            it("should not null when getCorsOption with origin as a function" , () => {
                options.should.not.be.null;
                options.should.have.property('origin');
                options.origin.should.be.a('function');
            });

            it("should able to allow *.domain.com", (done) => {
                options.origin("b.domain.com", (error, valid) => {
                    valid.should.be.true;
                    done();
                })
            });

            it("should able to allow AAA.com", (done) => {
                options.origin("AAA.com", (error, valid) => {
                    valid.should.be.true;
                    done();
                })
            });

            it("should able to reject AAA.com", (done) => {
                options.origin("AAA.com", (error, valid) => {
                    valid.should.be.true;
                    done();
                })
            });

            it("should able to reject *.notaccepted.com", (done) => {
                options.origin("b.notaccepted.com", (error, valid) => {
                    expect(valid).be.satisfies((val) => !val, "undefined or false");
                    error.should.not.null;
                    expect(error).to.be.an.instanceOf(CorsOriginNotAccepeted);
                    done();
                });
            });
        });
    });
});