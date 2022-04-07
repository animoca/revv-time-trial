import { validationResult, checkSchema } from 'express-validator/check';
import {RedisClient} from "../lib/redis";
import {session as sessionConf} from "config";
import {ValidationError, AddressVerificationNeeded} from '../lib/error';
import { logger } from '../lib/logger';
import {Utils} from "../lib/utils";
// digest
const {secret, ttl} = sessionConf;
const sessionCookieOption = {maxAge : ttl};
const sessionApiSchema = {
  // walletAddress : AddressSchemaValidator
}

const schemaValidation = checkSchema(sessionApiSchema);

const middlewareFn = async (req, res, next) => {
  try {
    const cookieDomain = req.hostname.replace(req.subdomains.join("."), "");
    const validationErrors = validationResult(req);
    if(!validationErrors.isEmpty()) {
      throw new ValidationError(validationErrors.array())
    }
    let sessionId = req.cookies.sessionId
    let session = null;
    const redisSessionId = Utils.sha1(sessionId + secret).replace("=", "");
    if(sessionId) {
       session = await RedisClient.hgetall(redisSessionId);
       logger.debug("User session", session);
       if(session) {
          RedisClient.expire(redisSessionId, 1209600);
          res.cookie("sessionId", sessionId, {...sessionCookieOption, domain: cookieDomain});
        } else {
          res.cookie("sessionId", null, {maxAge : -1, domain: cookieDomain});
          throw new AddressVerificationNeeded();
        }
    } else {
      throw new AddressVerificationNeeded();
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

const extractSessionOrThrow = [schemaValidation, middlewareFn];

export {extractSessionOrThrow} ;