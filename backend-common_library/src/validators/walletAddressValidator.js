import {toChecksumAddress, BN} from "web3-utils";
const address0 = new BN(0);

const WalletAddressValidator = {
  errorMessage: 'address is missing',
  isString: true,
  custom: {
    errorMessage : "address is equal to address(0)",
    options: (value, { req, location, path }) => {
      return BigInt(value) != address0 || !value;
    }
  },
  customSanitizer: {
    options: (value, { req, location, path }) => {
      const chainId = req.body.chainId  || req.query.chainId || process.env.CHAIN_ID || process.env.NETWORK_ID;
      req.chainId = chainId;
      return toChecksumAddress(value, chainId);
    }
  }
};

export {WalletAddressValidator};