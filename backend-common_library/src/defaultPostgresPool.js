import {postgres as postgresConfig} from "config";
import {asyncShutdownHook} from "./shutdown"
const { Pool } = require('pg')

let instance = null;

const DefaultPostgresPool = () => {
  if(!instance) {
    instance = new Pool({connectionString:postgresConfig.url});
    asyncShutdownHook(async ()=>{await instance.end();})
  }
  return instance;
} 

export {DefaultPostgresPool};