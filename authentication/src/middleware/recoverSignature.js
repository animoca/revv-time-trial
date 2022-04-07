import { checkSchema } from 'express-validator/check';
import {dapper as dapperConf} from "config";
import {AuthError, ValidationError} from '@animocabrands/backend-common_library';
import {AddressSchemaValidator} from '../lib/customValidators';
import EthSigUtil from 'eth-sig-util';
import DappAuth from '@dapperlabs/dappauth';
import logger from 'winston';

const signatureApiSchema = {
  walletAddress : AddressSchemaValidator,
  data : { isString : true},
  sig : { isString : true}
}

console.log("Dapper httpProvider.", dapperConf.url);
var dappAuth = new DappAuth(dapperConf.url);
const dapperMessageValidator = (data, sig, walletAddress) => new Promise(async (resolve, reject ) => {
  try {
    // lowercase address bacause it is making a contract call, without lowercasing it will throw during validation.
    const valid = await dappAuth.isAuthorizedSigner(data, sig, walletAddress.toLowerCase());
    if(!valid) {
      throw new ValidationError("recoverPersonalSignature failed", walletAddress);
    }
    resolve({walletAddress, provider : "dapper"});
  } catch(e) {
    logger.warn("failed to validate using dapperauth",e);
    reject(e);
  }
});

const web3MessageValidator = (data, sig, walletAddress) => new Promise( (resolve, reject) => {
  try {
    logger.debug(`Validating using Web3 ${walletAddress}`);
    const address = EthSigUtil.recoverPersonalSignature({ data: data, sig: sig });
    if(address.toLowerCase() != walletAddress.toLowerCase()) {
      throw new ValidationError("recoverPersonalSignature failed", walletAddress);
    }
    resolve({walletAddress, provider: "metamask"});
  } catch (e) {
    logger.warn("failed to validate using web3",e);
    reject(e)
  }
});

const schemaValidation = checkSchema(signatureApiSchema);
const middlewareFn = async (req, res, next) => {
  try {
    const {data, sig, walletAddress, walletProvider } = (req.body.data) ? req.body : req.query;
    let validationFunction = (()=> {
      switch (walletProvider) {
        case "dapper" : return dapperMessageValidator;
        case "metamask" : return web3MessageValidator;
        default : return (data, sig, walletAddress) => {
          return web3MessageValidator(data, sig, walletAddress).catch(() => dapperMessageValidator(data, sig, walletAddress));
        }
      }
    })();
    
    const recoverPersonalSignature = await validationFunction(data, sig, walletAddress);
    
    if(!recoverPersonalSignature) {
      throw new AuthError("address is not a valid message signer");
    }

    req.recoveredSignature =  recoverPersonalSignature;
    next();
  } catch(e) {
    next(e);
  }
}

const recoverSignatureOrThrow = [schemaValidation, middlewareFn];

export {
  recoverSignatureOrThrow
};