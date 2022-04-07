const express = require('express');
const router = express.Router();
const webpurifyConf = require("config").get('webpurify');
const {Webpurify, webpurify = new Webpurify(webpurifyConf)} = require('../lib/webpurify');
const {ProfanityCheckError} = require('../lib/error');
import {apiRoute} from './api';
import {registrationRoute} from './registration';
import {addressVerificationRoute} from './addressVerification';
import {emailVerificationRoute} from './emailVerification';
import {nicknameRoute} from "./nickname";
/* GET home page. */
router.get('/ping', function(req, res, next) {
  res.json({response: "pong"});
});

router.get('/profanityCheck', async (req, res, next) => {
  try {
    const text = req.query["text"];
    if (await webpurify.check(text)) {
      throw new ProfanityCheckError(`Profanity text detected.`, text);
    }
    else {
      res.json(({response: "ok", data: {text : text}}));
    }
  } catch(err) {
    next(err);
  }
});
router.use("/nicknames", nicknameRoute); 
router.use("/api", apiRoute);
router.use("/registration", registrationRoute);
router.use("/addressVerification", addressVerificationRoute);
router.use("/emailVerification", emailVerificationRoute);

module.exports = router;
