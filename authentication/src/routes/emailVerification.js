import express from 'express';
const emailVerificationRoute = express.Router();
import {extractSessionOrThrow} from "../middleware/extractSession";
import {sendEmailVerification} from "../middleware/sendEmailVerification";

import logger from "winston";
import {RedisClient} from "../lib/redis";
import {EmailVerificationNotFoundError} from '../lib/error';
import {promisify} from 'util';
import {instance as MongoUtil} from '../lib/mongoutil';

emailVerificationRoute.all("/resend", extractSessionOrThrow);
emailVerificationRoute.all("/resend", sendEmailVerification);
emailVerificationRoute.all("/resend", async(req, res, next) => {
  const {verificationLink} = req;
  logger.debug("Verification Link", {verificationLink});
  res.status(200).json({});
});

emailVerificationRoute.all("/verify/:verificationCode", async (req, res, next) => {
  try {
    const verificationCode  = req.params.verificationCode || req.body.verificationCode;
    const redisKey = `email_verification${verificationCode}`
    const promise = promisify((fn) => { RedisClient.multi().get(redisKey).del(redisKey).exec(fn) })
    let [walletAddress, isDeleted] = await promise();
    if(!walletAddress) {
      throw new EmailVerificationNotFoundError("verification key not found.");
    }

    const col = await MongoUtil.getCollection("users");
    const updateOneRes = await col.updateOne({walletAddress}, 
      { 
        $set : { emailVerified : true },
        $currentDate: { lastModifiedTs: {$type: "timestamp"} }
      });
      logger.debug(updateOneRes)
    if(updateOneRes.result.ok != 1) {
      throw new UserNotFound(`${walletAddress} not found.`);
    }
    res.status(200).json({emailVerified : true});
  } catch (e) {
    next(e);
  }
  
})


export {emailVerificationRoute};