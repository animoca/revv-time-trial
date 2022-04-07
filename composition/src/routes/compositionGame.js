import Express from 'express';
import { validationResult, checkSchema, } from 'express-validator/check';
import { MongoDBUtils, DefaultMongoDBClient, Middleware } from "@animocabrands/backend-common_library";
import 'cross-fetch/polyfill';
import { nftOwner,LeaderboardTiers, contractAddress } from "config"
import {utils, mappings} from "@animoca/f1dt-core_metadata";
import { ItemNotOwnedError, InvalidTokenIdError, InvalidCompositionIdError, InvalidSeasonError, InvalidItemTypeError, InvalidCompositionNameError,InvalidTyreTokenIdError,TyresNotOwnedError } from "./compositionGameError";
const compositionGame = Express.Router();
const {extractSessionOrThrow} = Middleware;

const tokenIdValidator = {
  tokenId:
    { in: ['body'], isString: true }
}

const compositionIdValidator = {
  compositionId: {
    in: ['params'], isInt: {
      options: {
        min: 1, max: 10
      }
    }
  }
}

const compositionNameValidator = {
  name: { in: ['body'], isString: true }
}

const ownersCollectionName = (async () => {
  return await MongoDBUtils.getCollectionNameByContractAddress(contractAddress, nftOwner)
})()

const compositionCollectionName = (seasonId) => {
  const prefix = (seasonId == 2)?`compositions` : `compositions_${seasonId}`;
  return (async () => {
    return await MongoDBUtils.getCollectionNameByContractAddress(contractAddress, prefix)
    })()
}

const compositionNameCollectionName = (seasonId) => {
  const prefix = (seasonId == 2)?`compositionNames` : `compositionNames_${seasonId}`;
  return (async () => {
    return await MongoDBUtils.getCollectionNameByContractAddress(contractAddress, prefix)
    })()
  }

  //don't remove this semicolon. Babel bug? https://github.com/babel/babel/issues/7172
  ; (async () => {
    const col = await DefaultMongoDBClient().getCollection((await compositionCollectionName(2)));
    try {
      col.createIndex({ "tokenId": 1 }, { unique: true });
    } catch (error) {
      console.error("Error in create index ", error);
    }
    const col2020 = await DefaultMongoDBClient().getCollection((await compositionCollectionName(3)));
    try {
      col2020.createIndex({ "tokenId": 1 }, { unique: true });
    } catch (error) {
      console.error("Error in create index ", error);
    }
  })()

compositionGame.all("*", extractSessionOrThrow());
const getUserBySession = async (req, res, next) => {
  try {
    const col = await DefaultMongoDBClient().getCollection("users");
    const walletAddress = req.session.walletAddress;
    const result = await col.findOne({ walletAddress });
    const { lastModifiedTs, lastModified = (lastModifiedTs) ? lastModifiedTs.getHighBits() * 1000 : 0, _id, token, ...doc } = result;
    req.user = { ...doc, lastModified };
    next();
  } catch (e) {
    next(e)
  }
};

const seasonMiddleware = async (req, res, next) => {
  try{
    const { season } = req.params;
    const seasonName = season || '2019';
    const seasonMapping = mappings.Common.Attributes.Season.ByName[seasonName];
    if(!seasonMapping)
      throw new InvalidSeasonError();

    req.seasonId = seasonMapping.seasonId;
    next();
  }catch(e){
    next(e);
  }
}

compositionGame.use((req, res, next) => {
  console.log(req.method, req.path)
  next()
})



compositionGame.get("/:season(2019|2020)?/team_names", getUserBySession, seasonMiddleware, async (req, res, next) => { // responds with items and composition
  try {
    const { walletAddress } = req.user;
    const names = await getCompositionNames(walletAddress,req.seasonId);
    res.json(names);
  } catch (e) {
    next(e);
  }
});

const getTierForAttributes = (attrs) => {
  for (var i = 0; i < LeaderboardTiers.length; i++)
      if(attrs <= LeaderboardTiers[i].max)
          return LeaderboardTiers[i].tier;
  return LeaderboardTiers[LeaderboardTiers.length-1].tier;
}


compositionGame.get("/:season(2019|2020)?/tier/:compositionId", checkSchema(compositionIdValidator));
compositionGame.get("/:season(2019|2020)?/tier/:compositionId", getUserBySession, seasonMiddleware, async function (req, res, next)  {
    try {
        const tyreToken = req.query.tyreToken;
        let { compositionId } = req.params;
        const { walletAddress } = req.user;


        var validationErr = validationResult(req).mapped();
        if (validationErr.compositionId)
            throw new InvalidCompositionIdError();


        const tyres = utils.getCoreMetadata(tyreToken);
        if (tyres.type != "Tyres")
            throw new InvalidTyreTokenIdError();

        if(!await checkTokenForWalletAddress(walletAddress,tyreToken))
            throw new TyresNotOwnedError();

            
        const collection = await DefaultMongoDBClient().getCollection((await compositionCollectionName(req.seasonId)));
        const tokens = await getCompositionForId(collection,req.session.walletAddress,compositionId)
        
        tokens.push(tyreToken);
        const total = tokens.reduce((totalAttributes,token)=>{
          const coreMetdata = utils.getCoreMetadata(token);
          return totalAttributes + coreMetdata.racing.stat1 + coreMetdata.racing.stat2 + coreMetdata.racing.stat3;
        },0);
        
        const tier = getTierForAttributes(total);
        res.json({tier});
    }  catch (e) {
        next(e);
    }
});

compositionGame.put("/:season(2019|2020)?/unequip", checkSchema(tokenIdValidator))
compositionGame.put("/:season(2019|2020)?/unequip", getUserBySession, seasonMiddleware, async (req, res, next) => { // removes item from compo
  try {
    const { walletAddress } = req.user;
    const { tokenId } = req.body;
    
    var validationErr = validationResult(req).mapped();
    if (validationErr.tokenId)
      throw new InvalidTokenIdError()
    
    if (!await checkTokenForWalletAddress(walletAddress, tokenId))
      throw new ItemNotOwnedError();
    const col = await DefaultMongoDBClient().getCollection((await compositionCollectionName(req.seasonId)));
    await col.deleteOne({ walletAddress, tokenId });
    res.json((await getComposition(walletAddress,req.seasonId)));
  } catch (e) {
    next(e);
  }
});

compositionGame.put("/:season(2019|2020)?/equip/:compositionId", checkSchema({ ...compositionIdValidator, ...tokenIdValidator }))
compositionGame.put("/:season(2019|2020)?/equip/:compositionId", getUserBySession, seasonMiddleware, async (req, res, next) => { //equips item into team
  try {
    const { walletAddress } = req.user;
    let { tokenId } = req.body;
    let { compositionId } = req.params;

    var validationErr = validationResult(req).mapped();
    if (validationErr.compositionId)
      throw new InvalidCompositionIdError()
    if (validationErr.tokenId)
      throw new InvalidTokenIdError()

    if (!await checkTokenForWalletAddress(walletAddress, tokenId))
      throw new ItemNotOwnedError();

    const col = await DefaultMongoDBClient().getCollection((await compositionCollectionName(req.seasonId)));
    const coreMetdata = utils.getCoreMetadata(tokenId);
    const type = coreMetdata.typeId;
    const subType = coreMetdata.subTypeId;
    let team = coreMetdata.teamId;
    const typeName = coreMetdata.type;

    if(coreMetdata.seasonId != req.seasonId)
      throw new InvalidSeasonError();
    
    if(typeName == "Tyres" || typeName == "Track")
      throw new InvalidItemTypeError();
      
    if (typeName != "Car" && typeName != "Driver")
      team = null
    
    if (team != null) {
      const typeToRemove = (typeName == "Car") ? typeToTypeId("Driver") : typeToTypeId("Car");
      await col.findOneAndDelete({ walletAddress, type: {$eq:typeToRemove}, compositionId, team: { $nin: [111,team] } });
    }

    await col.findOneAndDelete({ walletAddress, compositionId, type, subType });
    const result = await col.findOneAndUpdate(
    { $or: [
        { tokenId },
        { walletAddress, compositionId, type, subType }]},
        { $set: { walletAddress, tokenId, compositionId, type, subType, team }
    }, { upsert: true });

    res.json((await getComposition(walletAddress,req.seasonId)));
  } catch (e) {
    next(e);
  }
});

compositionGame.put("/:season(2019|2020)?/rename/:compositionId", checkSchema({...compositionIdValidator, ...compositionNameValidator}))
compositionGame.put("/:season(2019|2020)?/rename/:compositionId", getUserBySession, seasonMiddleware, async (req, res, next) => {
  try {
    const { walletAddress } = req.user;
    let { name } = req.body;
    let { compositionId } = req.params;

    var validationErr = validationResult(req).mapped();
    if (validationErr.compositionId)
      throw new InvalidCompositionIdError()
    if (validationErr.name)
      throw new InvalidCompositionNameError()


    let col = await DefaultMongoDBClient().getCollection((await compositionNameCollectionName(req.seasonId)));
    let filter = {walletAddress}
    let key = `names.${compositionId}`
    let update = {
      $set: {[key] : name}
    }
    await col.findOneAndUpdate(filter, update, {upsert: true})
    res.json(true)
    
  } catch(e) {
    next(e);
  }
})


compositionGame.put("/:season(2019|2020)?/reset/:compositionId", checkSchema(compositionIdValidator))
compositionGame.put("/:season(2019|2020)?/reset/:compositionId", getUserBySession, seasonMiddleware, async (req, res, next) => { //equips item into team
  try {
    const { walletAddress } = req.user;
    const { compositionId } = req.params;

    var validationErr = validationResult(req).mapped();
    if (validationErr.compositionId)
      throw new InvalidCompositionIdError()
    

    const col = await DefaultMongoDBClient().getCollection((await compositionCollectionName(req.seasonId)));

    await col.remove({ walletAddress, compositionId });

    res.json((await getComposition(walletAddress,req.seasonId)));
  } catch (e) {
    next(e);
  }
});


compositionGame.get("/:season(2019|2020)?", getUserBySession, seasonMiddleware, async (req, res, next) => { // responds with items and composition
  try {
    
    const { walletAddress } = req.user;
    const { excludeItems } = req.query;
    pruneInvalidTokensForWalletAddress(walletAddress,req.seasonId)
    const items = (excludeItems == "true")
      ? Promise.resolve([])
      : await getItemsForOwner(walletAddress,req.seasonId)
    const composition = await getComposition(walletAddress,req.seasonId);
    const names = await getCompositionNames(walletAddress,req.seasonId);
    res.json({ items, composition, names });
  } catch (e) {
    next(e);
  }
});


compositionGame.get("/:season(2019|2020)?/:compositionId", checkSchema(compositionIdValidator))
compositionGame.get("/:season(2019|2020)?/:compositionId", getUserBySession, seasonMiddleware, async (req, res, next) => { 
  try {
    
    const { walletAddress } = req.user;
    let { compositionId } = req.params;

    var validationErr = validationResult(req).mapped();
    if (validationErr.compositionId)
      throw new InvalidCompositionIdError()

    pruneInvalidTokensForWalletAddress(walletAddress)
    const col = await DefaultMongoDBClient().getCollection((await compositionCollectionName(req.seasonId)));
    const composition = await getCompositionForId(col, walletAddress,compositionId);
    let loadout = composition && composition.length
      ? getLoadoutForTeamComposition(composition)
      : null;

      const getTier = req.query.getTier;
      if(getTier){
        const tyreToken = req.query.tyreToken;
        if(tyreToken){
          const tyres = utils.getCoreMetadata(tyreToken);
          if (tyres.type != "Tyres")
              throw new InvalidTyreTokenIdError();

          if(!await checkTokenForWalletAddress(walletAddress,tyreToken))
              throw new TyresNotOwnedError();

          composition.push(tyreToken);
        }
        const total = composition.reduce((totalAttributes,token)=>{
          const coreMetdata = utils.getCoreMetadata(token);
          return totalAttributes + coreMetdata.racing.stat1 + coreMetdata.racing.stat2 + coreMetdata.racing.stat3;
        },0);
        
        const tier = getTierForAttributes(total);
        if(!loadout)
          loadout = {};
        loadout = Object.assign(loadout,{tier});
      }

    res.json(loadout);
  } catch (e) {
    next(e);
  }
});




const getComposition = async (walletAddress,seasonId) => {
  const collection = await DefaultMongoDBClient().getCollection((await compositionCollectionName(seasonId)));
  const obj = await collection.find({ walletAddress }, { projection: { _id: 0, tokenId: 1, compositionId: 1 } });
  const arr = await obj.toArray()
  return arr.reduce((map, entry) => {
    map[entry.tokenId] = Number(entry.compositionId)
    return map
  }, {})
}
const getCompositionForId = async (collection, walletAddress, compositionId) => {
  const obj = await collection.find({ walletAddress,compositionId }, { projection: { _id: 0, tokenId: 1} });
  const arr = await obj.toArray()
  return arr.map((entry) => { 
    return entry.tokenId
  })
}
const getCompositionNames = async (walletAddress,seasonId) => {
  const collection = await DefaultMongoDBClient().getCollection((await compositionNameCollectionName(seasonId)));
  let obj = await collection.findOne({walletAddress}, { projection: {_id: 0, names: 1} });
  return obj ? obj.names : {};
}

const checkTokenForWalletAddress = async (walletAddress, tokenId) => {
  const col = await DefaultMongoDBClient().getCollection((await ownersCollectionName));
  const obj = await col.findOne({ owner: walletAddress, tokenId }, { projection: { _id: 0, tokenId: 1 } })
  return obj != null
}
const getItemsForOwner = async (walletAddress,seasonId) => {
  const col = await DefaultMongoDBClient().getCollection((await ownersCollectionName));
  const obj = await col.find({ owner: walletAddress }, { projection: { _id: 0, tokenId: 1 } })
  const items = (await obj.toArray()).map((doc) => `${doc.tokenId}`);
  return items.filter(tokenId => {
    const coreMetadata = utils.getCoreMetadata(tokenId);
    return coreMetadata.seasonId == seasonId;
  })
}

const pruneInvalidTokensForWalletAddress = async (walletAddress, seasonId) => {
  const compoColName = (await compositionCollectionName(seasonId))
  const ownersCol = await DefaultMongoDBClient().getCollection((await ownersCollectionName));
  const compositionCol = await DefaultMongoDBClient().getCollection(compoColName);

  const result = await ownersCol.aggregate([
    {$match:{owner:walletAddress}},
    {$lookup:{from:compoColName,localField: "tokenId",foreignField:"tokenId",as:"compoDoc"}},
    {$unwind:"$compoDoc"},
    {$match: { $expr: { $eq:["$owner","$compoDoc.walletAddress"] } } },
    {$project:{_id:0,tokenId:1}}
  ])
  const ownedTokens = (await result.toArray()).map((entry)=>entry.tokenId)
  await compositionCol.deleteMany({walletAddress,tokenId:{$nin:ownedTokens}})

}

const getLoadoutForTeamComposition = (tokenIds) => {
  const carAttrTotal = {topSpeed:0,acceleration:0,grip:0};
  const driverAttrTotal = {stamina:0,aggression:0,concentration:0};

  const loadoutData = tokenIds.reduce((loadout,tokenId)=>{
      const coreMetadata = utils.getCoreMetadata(tokenId);
      const tokenType = coreMetadata.type;
      const tokenSubType = coreMetadata.subType;
      
      if(tokenType == "Car" || tokenType == "Part")
      {
       carAttrTotal.topSpeed += coreMetadata.racing.stat1;
       carAttrTotal.acceleration += coreMetadata.racing.stat2;
       carAttrTotal.grip += coreMetadata.racing.stat3; 
      }

      if(tokenType == "Driver" || tokenType == "Gear")
      {
        driverAttrTotal.stamina += coreMetadata.racing.stat1;
        driverAttrTotal.aggression += coreMetadata.racing.stat2;
        driverAttrTotal.concentration += coreMetadata.racing.stat3; 
       }

      if(tokenType == "Car")
        loadout[tokenType.toLowerCase()] = {tokenId};
      else if(tokenType == "Driver")
        loadout[tokenType.toLowerCase()] = {tokenId};
      else if(tokenType == "Part")
      {
        if(!loadout.hasOwnProperty("parts"))loadout["parts"]=[];
        loadout["parts"].push({tokenId,
          type:tokenSubType.toLowerCase(),
          attributes:{topSpeed:coreMetadata.racing.stat1,acceleration:coreMetadata.racing.stat3,grip:coreMetadata.racing.stat3}})
      }
      else if(tokenType == "Gear")
      {
        if(!loadout.hasOwnProperty("gear"))loadout["gear"]=[];
        loadout["gear"].push({tokenId,
          type:tokenSubType.toLowerCase(),
          attributes:{stamina:coreMetadata.racing.stat1,aggression:coreMetadata.racing.stat3,concentration:coreMetadata.racing.stat3}})
      }
      return loadout
    },{})

    if(!loadoutData.hasOwnProperty("car"))loadoutData.car={}
    loadoutData.car.attributes = carAttrTotal
    
    if(!loadoutData.hasOwnProperty("driver"))loadoutData.driver={}
    loadoutData.driver.attributes = driverAttrTotal

    loadoutData.tokens = tokenIds;
    return loadoutData;
    
}

const typeToTypeId = (typeName) => {
  return Number(mappings.Common.Attributes.Type.ByName[typeName].typeId);
}


export { compositionGame };