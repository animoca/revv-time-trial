import chai,{expect} from 'chai';
import {MongoDBUtils} from "../src/mongoDBUtils";
import { logger } from '../src/logger';
import ganache from "ganache-cli";
import Web3 from "web3";


describe("MongoDbUtils", async () => {
  const web3 = new Web3(ganache.provider({network_id : 4}));
  
  process.env.CHAIN_ID = 4;

  const contract = new web3.eth.Contract([], "0xFEC508bdcA5daF8018ef55a1042490e5Ec82ebB7");
  
  it("should able to derived a collectionName from contractId", async function() {
    this.timeout(5000);
    const derivedCollectionName = await MongoDBUtils.getCollectionNameByContractWithWeb3(contract, web3, "test");
    expect(derivedCollectionName).equals("test_0xFeC508bdCa5DaF8018EF55a1042490e5Ec82ebB7");
  });

  it("should able to derived a collectionName from contractId with collection suffix", async function() {
    this.timeout(5000);
    const derivedCollectionName = await MongoDBUtils.getCollectionNameByContractWithWeb3(contract, web3, "test", "suffix1");
    expect(derivedCollectionName).equals("test_0xFeC508bdCa5DaF8018EF55a1042490e5Ec82ebB7_suffix1");
  });

  
});