import {mongodb as mongodbConfig} from "config";
import {MongoDBClient} from "./mongoDBClient";

let instance = null;

const DefaultMongoDBClient = () => {
  if(!instance) {
    instance = new MongoDBClient(mongodbConfig);
  }
  return instance;
} 

export {DefaultMongoDBClient};