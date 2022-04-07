import { validationResult, checkSchema, check, cookie } from 'express-validator';
import {DefaultRedisClient} from "../defaultRedisClient";
import {session as sessionConf} from "config";
import {ValidationError} from '../error';
import {UserSessionNotFound} from './extractSessionErrors';
import {Utils} from "../utils";
import logger from "winston";
// digest
const schemaValidation = cookie('sessionId', "SessionId not found.");

const middlewareFn = (redis) => async (req, res, next) => {
  try {
    if(!redis) redis = DefaultRedisClient()
    const {secret, ttl} = sessionConf;
    const sessionCookieOption = {maxAge : ttl};
    const cookieDomain = req.hostname.replace(req.subdomains.join("."), "");
    const validationErrors = validationResult(req);
    if(!validationErrors.isEmpty()) {
      throw new ValidationError(validationErrors.array())
    }
    let sessionId = req.cookies.sessionId
    let session = null;
    const redisSessionId = Utils.sha1(sessionId + secret).replace("=", "");
    if(sessionId) {
       session = await redis.hgetall(redisSessionId);
       logger.debug("User session", session);
       if(session) {
          redis.expire(redisSessionId, 1209600);
          res.cookie("sessionId", sessionId, {...sessionCookieOption, domain: cookieDomain});
        } else {
          res.cookie("sessionId", null, {maxAge : -1, domain: cookieDomain});
          throw new UserSessionNotFound();
        }
    } else {
      throw new UserSessionNotFound();
    }
     // create a new Session and update the database if needed
    // Logger.error(`${token.toString("base64")}`, new Error())
    req.session = session;
    req.sessionKey = redisSessionId;
    next();
  } catch(e) {
    next(e)
  }
}

const extractSessionOrThrow = (redis) => [schemaValidation, middlewareFn(redis)];

export {extractSessionOrThrow};