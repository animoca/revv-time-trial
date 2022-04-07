import express from 'express';
const registrationRoute = express.Router();
import {extractSessionOrThrow} from "../middleware/extractSession";
import {sendEmailVerification} from "../middleware/sendEmailVerification";
import {mailerliteNewsletterSubscription} from "../middleware/mailerliteNewsletterSubscription";
import {AddressSchemaValidator} from "../lib/customValidators";
import {UserAlreadyRegistered, ValidationError, WalletAddressNotMatch} from "../lib/error";
import {checkSchema, validationResult } from 'express-validator/check';
import {instance as MongoUtil} from '../lib/mongoutil';
import {MongoError} from "mongodb";

const registrationSchema = {
  nickname : {isString : true},
  email : {isEmail : true},
  walletAddress : AddressSchemaValidator
}
registrationRoute.all("*", extractSessionOrThrow);
registrationRoute.post("/", checkSchema(registrationSchema), async (req, res, next) => {
  try {
    const validationErrors = validationResult(req);
    if(!validationErrors.isEmpty()) {
      throw new ValidationError(validationErrors.array())
    }
    const {registration, ...session} = req.session;
    const {walletAddress, walletProvider} = session;
    const currentWalletAddres = req.query.walletAddress || req.body.walletAddress;
    
    if(walletAddress != currentWalletAddres) {
      throw new WalletAddressNotMatch(walletAddress);
    }
    const col = await MongoUtil.getCollection("users");
    const {email} = await col.findOne({walletAddress}, {email : 1});
    if(!email) {
      // register user in database
      const {nickname, email , newsletter, age } = req.body;
      const {walletAddress} = session;
      const findAndModifiedRes = await col.findOneAndUpdate({walletAddress}, 
      { 
        $set : { nickname, email , newsletter, age, walletProvider},
        $currentDate: { lastModifiedTs: {$type: "timestamp"} }
      }, {upsert : true, returnOriginal: false} );
      if(findAndModifiedRes.value) {
        const { lastModifiedTs, lastModified = (lastModifiedTs) ? lastModifiedTs.getHighBits() * 1000 : 0, _id, token, ...doc} = findAndModifiedRes.value;
        req.isNewUser = true;
        // add new user to the session;
        req.user = doc;
        req.user.lastModifiedTs = lastModified;
      } else {
        throw new Error("Cannnot create user");
      }
      // upgrade user session into a login session
      next()
    } else {
      throw new UserAlreadyRegistered(req.session.walletAddress);
    }
  } catch (e) {
    if(e.constructor == MongoError) {
      switch (e.code) {
        case 11000:
            const error = (new UserAlreadyRegistered()).wrapError(e);
            next(error);
          break;
        default: 
            next(e);
          break;
      }
    } else {
      next(e);
    }
    // console.log(e);
  }
});
registrationRoute.post("/", sendEmailVerification);
registrationRoute.post("/", mailerliteNewsletterSubscription);
registrationRoute.post("/", async(req, res, next) => {
  const {id ,...session} = req.session;
  const user = req.user;
  res.status(req.isNewUser ? 201: 200).json({...user, ...session});
})

export {registrationRoute};