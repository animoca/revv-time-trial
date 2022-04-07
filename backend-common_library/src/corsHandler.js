import {AppBootstrapError, CorsOriginNotAccepeted} from "./error";
import { threadId } from "worker_threads";

class CorsHandler {

  constructor(conf) {
    if(!Array.isArray(conf)) {
      throw new AppBootstrapError("cors configuration not an array", conf);
    }
    this.conf = conf;
    this.setup();
  }

  createUrlValidator = (url) => (origin) => url == origin;

  createRegexValidator = (regex) => (origin) => origin.match(regex);

  setup() {
    if( !this.urlValidation ) {
      const validators = new Array();
      this.conf.forEach((obj) => {
        switch(typeof obj) {
          case 'object': 
            const {regex} = obj;
            validators.push(this.createRegexValidator(new RegExp(regex)));
            break;
          case 'string':
            validators.push(this.createUrlValidator(obj));
            break;
          default:
            console.warn(`not supporting ${obj}`)
            break;
        }
      });
      this.validators = validators;
    }
  }

  checkOrigin = (origin) => {
    if(!origin) {
      return true;
    }
    let validOrigin = false;
    for( const idx in this.validators) {
      const validator = this.validators[idx];
      if(validator(origin)) {
        validOrigin = true;
        break; 
      }
    }
    return validOrigin;
  }

  getCorsOption = (options) => {
    const validator = this.checkOrigin
    return {
      origin: function (origin, callback) {      
        if (validator(origin)) {
          callback(null, true)
        } else {
          callback(new CorsOriginNotAccepeted('Not allowed by CORS'))
        }
      },
      credentials: true,
      ...options
    }
  }
}

export {CorsHandler};