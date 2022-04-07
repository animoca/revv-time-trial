const axios = require('axios');
const logger = require('./logger');

class Webpurify {

  constructor(conf) {
    this.webpurifyConf = conf;
    this.webpurifyHttp = axios.create({
      baseURL: conf.url,
      timeout: 5000,
    });
    this.liveCheckConf = { method: 'webpurify.live.check', api_key: conf.api_key, format: 'json' };
  }

  async check(text) {
    try {
      const res = await this.webpurifyHttp.get("/", {
        params: {
          ...this.liveCheckConf,
          text: text
        }
      });
      return res.data.rsp.found == '1';
    } catch (error) {
      logger.error(`Webpurify check error ${error}`);
      return true;
    }
  }
  
  isReady()  {
    return this.webpurifyConf.enable
  }
}

module.exports = {Webpurify};
