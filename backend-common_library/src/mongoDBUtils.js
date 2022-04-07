import {toChecksumAddress} from 'web3-utils';

class MongoDBUtils {

  static cache = {};

  static async getCollectionNameByContractWithWeb3(contract, web3, collectionName, suffix = null) {
    const contractAddressString = (contract.address || contract.options.address).toLowerCase();
    let collection = this.cache[`${contractAddressString}`];
    if (!collection) {
      const contractAddress = web3.utils.toChecksumAddress(contractAddressString, process.env.CHAIN_ID);
      this.cache[`${contractAddressString}`] = contractAddress;
      collection = `${collectionName}_${contractAddress}`;
    }else{
      collection = `${collectionName}_${collection}`
    }

    if (suffix) {
      collection = `${collection}_${suffix}`
    }

    return collection;
  }

  static async getCollectionNameByContractAddress(contractAddress, collectionName, suffix = null) {
    const contractAddressString = contractAddress.toLowerCase();
    let collection = this.cache[`${contractAddressString}`];
    if (!collection) {
      const contractAddress = toChecksumAddress(contractAddressString, process.env.CHAIN_ID);
      this.cache[`${contractAddressString}`] = contractAddress;
      collection = `${collectionName}_${contractAddress}`;
    }else{
      collection = `${collectionName}_${collection}`
    }

    if (suffix) {
      collection = `${collection}_${suffix}`
    }

    return collection;
  }
}

export { MongoDBUtils };