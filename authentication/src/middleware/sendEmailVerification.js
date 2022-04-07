import {SES} from "aws-sdk";
import logger from 'winston';
import {RedisClient} from "../lib/redis";
import {v4 as uuid} from 'uuid';
import {Utils} from "../lib/utils";
import fs from "fs";
import path from "path";
import Mustache from 'mustache';
import {emailVerification as conf} from "config";
import {instance as MongoUtil} from '../lib/mongoutil';
import {RegistrationRequired} from "../lib/error";
const { ttl, ttlInSeconds = ttl / 1000, enable } = conf;
const middlewareFn = async (req, res, next) => {
  try {
      if (enable) {
       // email verification.
      const col = await MongoUtil.getCollection("users");
      const emailTemplateHtml = fs.readFileSync(path.join(__dirname, "../web/template/defaultEmailTemplate.html"), 'utf8');
      const emailTemplateText = fs.readFileSync(path.join(__dirname, "../web/template/defaultEmailTemplate.txt"), 'utf8');
      const walletAddress = req.session.walletAddress || req.body.walletAddress || req.query.walletAddress;
      let email;
      if(req.user && req.user.email) {
       email = req.user.email; 
      } else {
        email = (await col.findOne({walletAddress}, {email : 1})).email;
        if(!email) {
          throw new RegistrationRequired(walletAddress);
        }
      }
      
      logger.debug(`Sending user verification email for address ${walletAddress}`);
      const verificationCode = Utils.sha1(uuid(), "hex");
      const redisKey = `email_verification${verificationCode}`;
      await RedisClient.multi()
        .set(redisKey, walletAddress)
        .expire(redisKey, ttlInSeconds)
        .exec(logger.info);
      const lang = req.headers['accept-language'] || 'en';
      const origin = req.header('Origin');
      const verificationLink = `${origin}/?emailVerification=${verificationCode}`;
      req.verificationCode = verificationCode;
      req.verificationLink = verificationLink;
      const view = { verificationLink , email};
      const outputHtml = Mustache.render(emailTemplateHtml, view);
      const outputText = Mustache.render(emailTemplateText, view)
      
      const sesParams = {
        Destination: { /* required */
          CcAddresses: [
          ],
          ToAddresses: [
            `${email}`,
          ]
        },
        Message: {
          Body: {
           Html: {
            Charset: "UTF-8", 
            Data: `${outputHtml}`
           }, 
           Text: {
            Charset: "UTF-8", 
            Data: `${outputText}`
           }
          }, 
          Subject: {
           Charset: "UTF-8", 
           Data: "REVV Time Trial email verification, please verify your email"
          }
         }, 
        Source: conf.sourceEmail, /* required */
        ReplyToAddresses: [],
      };
      await new SES({apiVersion: '2010-12-01'}).sendEmail(sesParams).promise();
  }
    next()
  } catch (e) {
    next(e)
  }
};

export {middlewareFn as sendEmailVerification};
