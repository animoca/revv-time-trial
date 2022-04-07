const express = require('express');
const settings = require('config');
const sigUtil = require('eth-sig-util');
const db = require('../lib/db');
const { check, validationResult } = require('express-validator/check');
const DappAuth = require('@dapperlabs/dappauth');
const Web3 = require('web3');
const logger = require("../lib/logger");
const badwords = require("../lib/badwords");
const axios = require('axios');
const openseaConf = require('config').get('opensea');
const openSeaApiKey = openseaConf.api_key;
const openSeaEnable = openseaConf.enable;
import {webpurify as webpurifyConf} from "config"; 
import {Webpurify}  from '../lib/webpurify';
const webpurify = new Webpurify(webpurifyConf);

const router = express.Router();
const {AuthError, ValidationError, BadInputError} = require('../lib/error');

var verifySignature = (data, sig, from) => {
  // the originating wallet address is returned
  try {
    let messageSigner = sigUtil.recoverPersonalSignature({ data: data, sig: sig });
    return from === messageSigner;
  } catch(e) {
    logger.error(e);
    return false;
  }
};

const dappAuth = new DappAuth(new Web3.providers.HttpProvider(settings.dapper.url));
var verifyDapperSignature = async (data, sig, from) => {
   return await dappAuth.isAuthorizedSigner(
       data,
       sig,
       from,
  );
};

var updateToken = async (walletAddress) => {
  const token = await db.updateToken({walletAddress: walletAddress});
  return token;
};

var setSession = (res, token) => {
  res.cookie('sessionToken', token.toString('base64'), 
    {
      maxAge: 3600000,
      httpOnly: true,
      secure: false
    }
  ); 
};

var removeSession = (res) => {
  res.cookie("sessionToken", "", {maxAge: -1});
}


var defaultLoginCookieSettings = {
  httpOnly : true
};

/* GET users listing. */
router.post('/login', [
  check('msg').isString(),
  check('result').isString(),
  check('from').isString()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError()
    }
    var from = req.body.from;
    var result = req.body.result;
    var msg = req.body.msg;
    if(verifySignature(msg, result, from) || verifyDapperSignature(msg, result, from)){
      try {
        const token = await updateToken(from);
        setSession(res, token);
        const user = await db.getUser(token);
        res.json(({response: "ok", data: user}));
      } catch(e) {
        logger.info("Set Cookies for registration.")
        var secure = (req.protocol == "https");
        var domain = req.host.replace(/^[^.]+\./, ".");
        var cookieSettings = { ... defaultLoginCookieSettings, domain, secure};
        res.cookie('wallet.signed', 'true', {... cookieSettings, httpOnly : false});
        res.cookie('r.from', from,  {...cookieSettings, httpOnly : false}); 
        res.cookie('r.result', result,  cookieSettings); 
        res.cookie('r.msg', msg,  cookieSettings);
        throw e;
      }
    } else {
      throw new AuthError();
    }
    
  } catch (err) {
    next(err);
  }
});

const openseaApi = axios.create({
  baseURL: 'https://api.opensea.io/api/v1',
  headers: {
    'X-API-KEY': openSeaApiKey
  },
  timeout: 5000,
});



router.get('/logout', [], function(req, res, next) {
  removeSession(res);
  res.json({response: "ok"});
});

router.post('/logout',[], async (req, res, next) => {
  removeSession(res);
  res.json({response: "ok"});
});


router.post('/register', [
  check('from').isString(),
  check('nickname').isString(),
  check('email').isEmail()
], async (req, res, next) => {
  try {
    let msg = req.cookies["r.msg"] || req.body.msg;
    let result = req.cookies["r.result"] || req.body.result;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError();
    }
    var regex = /[-!$%^&*()+|~=`{}\[\]:";'<>?,.\/\s]+/;

    const nickname = req.body.nickname;
    if(regex.exec(nickname)){
      throw new BadInputError("Nickname should contain '_' and Alphanumeric Characters only.");
    }

    if(webpurify.isReady()) {
      if (await webpurify.check(nickname)) {
        throw new BadInputError("Nickname not allowed", "BADWORDS");
      }
    } else {
      if (await badwords.check(nickname)) {
        throw new BadInputError("Nickname not allowed", "BADWORDS");
      }
    }
    
    var isMetaMask = verifySignature(msg, result, req.body.from)
    if ( isMetaMask  || verifyDapperSignature(msg, result, req.body.from) ) {
      const userData = {
        walletAddress: req.body.from,
        nickname: nickname,
        email: req.body.email,
        newsletter: ((req.body._subscribe || req.body.subscribe) == "on"),
        age: ((req.body._age || req.body.age || "") == "on"),
        walletProvider : (isMetaMask) ? "metamask" : "dapper"
      };
      let user = await db.createUser(userData);
      const token = await updateToken(user.walletAddress);
      user = await db.getUser(token);
      if(openSeaEnable) {
        openseaApi.post('/user/email/external_verify/', {
          address: req.body.from,
          email: req.body.email,
          username:req.body.nickname
        })
        .then(function (response) {
          logger.info(response);
        })
        .catch(function (error) {
          // handle error
          logger.warn(`Opensea Api ${error.response.status}, ${error.response.body}`);
        });
      } else {
        logger.verbose("Skipping Opensea, opensea not enabled.")
      }
      
      var secure = (req.protocol == "https");
      var domain = req.hostname.replace(/^[^.]+\./, ".");
      var cookieSettings = { maxAge : -1, domain, secure};


      res.cookie('wallet.signed', '', cookieSettings);
      res.cookie('r.from', '',  cookieSettings); 
      res.cookie('r.result', '',  cookieSettings); 
      res.cookie('r.msg', '',  cookieSettings);
      setSession(res, token);
      res.json(({response: "ok", data: user}));
      
    } else {
      throw new AuthError();
    }
    
  } catch (err) {
    next(err);
  }
});



router.get('/', async (req, res, next) => {
  try {
    if(!req.cookies.sessionToken)
      throw new AuthError();

    var token = Buffer.from(req.cookies.sessionToken, 'base64');
    const user = await db.getUser(token);
    if(!user || user.disabled){
      throw new AuthError();
    }
    setSession(res, token);
    res.send({response: "ok", data: user })
  } catch (err) {
    next(err);
  }
});



module.exports = router;
