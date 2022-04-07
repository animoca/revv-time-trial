import express from 'express';
const addressVerificationRoute = express.Router();
import {recoverSignatureOrThrow} from "../middleware/recoverSignature";
import {session as sessionConf} from "config";
import {instance as MongoUtil} from '../lib/mongoutil';
import {v4 as uuid} from 'uuid';
import {Utils} from "../lib/utils";
import logger from 'winston';
import {RedisClient} from "../lib/redis";
import {RegistrationRequired} from '../lib/error';

const {secret, ttl, ttlInSeconds = ttl / 1000} = sessionConf;
const sessionCookieOption = {maxAge : ttl};
addressVerificationRoute.all("*", recoverSignatureOrThrow);
addressVerificationRoute.post("/", async (req, res, next) => {
  try {
    const cookieDomain = req.hostname.replace(req.subdomains.join("."), "");
    // look up address from the database and create a new session.
    const col = await MongoUtil.getCollection("users");
    const { walletAddress } = req.body;
    const document = { walletAddress };
    let session = null;
    const sessionId = uuid().replace(/-/g, "");
    const hashedSessionId = Utils.sha1(sessionId + secret).replace("=", "");
    const chainId = req.chainId;
    const findAndModifiedRes = await col.findOneAndUpdate(document, 
    { 
      $set : {chainId: chainId, ...document},
      $currentDate: { lastModifiedTs: {$type: "timestamp"} }
    }, { upsert : true, returnOriginal : false });
    if(findAndModifiedRes.value) {
      const { lastModifiedTs, lastModified = (lastModifiedTs) ? lastModifiedTs.getHighBits() * 1000 : 0, _id, token, walletAddress, email, ...doc} = findAndModifiedRes.value;
      logger.debug(`Creating user session for registered wallet ${walletAddress}`)
      const walletProvider =  req.body.walletProvider || req.recoveredSignature.provider
      session = { walletAddress, chainId, id : _id.toString(), lastModifiedTs : lastModified , walletProvider };
      await RedisClient.multi()
        .hmset(hashedSessionId, session)
        .expire(hashedSessionId, ttlInSeconds )
        .exec(logger.silly);
      // create a session from user
      res.cookie("sessionId", sessionId, {domain : cookieDomain, ...sessionCookieOption});
      if(!email) {
        throw new RegistrationRequired(walletAddress);
      }
      req.user = { walletAddress, email, ...doc, lastModified};
    }
    req.session = session;
    res.json(req.user);
  } catch (e) {
    next(e)
  }
});

export {addressVerificationRoute};