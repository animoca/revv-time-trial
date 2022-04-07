import {toChecksumAddress} from "web3-utils";
import {web3 as web3Conf} from "config";

const address0 = BigInt(0);

const AddressSchemaValidator = {
  errorMessage: 'address is missing',
  isString: true,
  custom: {
    errorMessage : "address is equal to address(0)",
    options: (value, { req, location, path }) => {
      return !value || BigInt(value) != address0;
    }
  },
  customSanitizer: {
    options: (value, { req, location, path }) => {
      let chainId = req.body.chainId  || req.query.chainId || web3Conf.networkId || 0;
      req.chainId = chainId;
      return toChecksumAddress(value, chainId);
    }
  }
};


export {AddressSchemaValidator};