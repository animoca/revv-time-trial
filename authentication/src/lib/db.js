const {UnknownApiError} = require('../lib/error');
const SecureToken = require('secure-token');
import logger from "winston";
import {instance as MongoUtil} from "./mongoutil";
import {mongodb as settings} from "config";
var client;

(async function() {
  try {
    const col = await MongoUtil.getCollection("users");
    client = await MongoUtil.getClient();
    logger.debug("Setting Up users Collection with indexes { walletAddress: 1}, { unique:true, background:true }");
    await col.createIndex({ walletAddress: 1}, { unique:true, background:true });
  } catch (err) {
    logger.error("Error setting up user indexes", err);
  }
})();


var createUser = async (userData) => {
  // TODO: provide some validation here
  // full user schema should be described here too, including unfilled fields
  const userSchemaData = {
    walletAddress: userData.walletAddress.toUpperCase(),
    nickname: userData.nickname,
    email: userData.email,
    age: userData.age,
    newsletter : userData.newsletter,
    walletProvider: userData.walletProvider,
    token: ''
  };
  const r = await client.db(settings.db).collection('users').insertOne(userSchemaData);
  if (!r.insertedId)
    throw new UnknownApiError([userData, "Cannot create user"]);
  return userSchemaData;
};

var deleteUser = async (user) => {
  const userSchemaData = {
    walletAddress: user.walletAddress.toUpperCase(),
  };
  const r = await client.db(settings.db).collection('users').deleteOne(userSchemaData);
  // if (!r.deletedCount)
  //   throw new UnknownApiError(["Cannot delete user"]);
};

var updateToken = async (user) => {
  const token = SecureToken.create();
  const hashToken = SecureToken.hash(token, 'session');
  const r = await client.db(settings.db).collection('users').updateOne({walletAddress: user.walletAddress.toUpperCase()}, { $set: {token: hashToken} });
  
  if (r.matchedCount === 0 ) 
    throw new UnknownApiError(["Cannot find user"]);
  else if (r.modifiedCount === 0)
    throw new UnknownApiError(["Cannot update user"]);
  return token;
};

var getUser = async(token) => {
  const hashToken = SecureToken.hash(token, 'session');
  const r = await client.db(settings.db).collection('users').findOne({token : hashToken});
  return r;
};

module.exports = {
  updateToken: updateToken,
  createUser: createUser,
  getUser: getUser,
  deleteUser: deleteUser
};

 


