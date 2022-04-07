import express from 'express';
import logger from "winston";
import {toChecksumAddress} from "web3-utils";
import {web3 as web3Conf} from "config";
import {instance as MongoUtil} from '../lib/mongoutil';

const nicknameRoute = express.Router();
nicknameRoute.post("*", async (req, res, next) => {
  try {
    const chainId = req.body.chainId  || req.query.chainId || web3Conf.networkId || 0;
    const walletAddresses = req.body.walletAddresses;
    const sanitizeWalletAddress = walletAddresses.map((address) => toChecksumAddress(address, chainId));
    logger.debug(`Querying nicknames for ${JSON.stringify(sanitizeWalletAddress)} chainId ${chainId}`);
    const col = await MongoUtil.getCollection("users");
    const dbResponse = await col.find({ "walletAddress" : {"$in" : sanitizeWalletAddress}}, {'_id' : 0, 'walletAddress' : 1, 'nickname' : 1});
    let walletNameMap = {};
    await dbResponse.forEach((obj) => walletNameMap[obj.walletAddress] = obj.nickname);
    logger.debug(`Response for wallets for ${JSON.stringify(walletNameMap)}`);
    return res.json(walletNameMap);
  } catch (e) {
    next(e);
  }
});

export{nicknameRoute};