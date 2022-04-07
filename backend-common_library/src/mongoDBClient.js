
import MongoClient from 'mongodb'
import {mongodb as config} from 'config'
import logger from 'winston'
import {asyncSystemShutdownHook} from './shutdown';
class MongoDBClient {
  
  constructor(config) {
    const {url} = config;
    this.url = url;
    asyncSystemShutdownHook(async () => {
      this.close();
    });
  }

  async getClient() {
    if(!this.client) {
      logger.debug("Connecting to MongoDB");
      this.client = await MongoClient.connect(this.url, {useNewUrlParser: true}); 
    }
    return this.client;
  }

  async getDb(name = null) {
    try {
      const client =  (await this.getClient());
      return await client.db(name);
    } catch(e) {
      this.close(e);
    }
  }

  async getCollection(name) {
    try {
      const db  = (await this.getDb());
      return await db.collection(name);
    } catch(e) {
      this.close(e);
    }
  }

  close(e = null) {
    if(e) {
      logger.error("Closing MongoDb Connection", e);
    } else {
      logger.info("Closing MongoDb Connection");
    }
    if(this.client) {
      this.client.close(true)
      this.client = null;
    }
  }

}
export {MongoDBClient};