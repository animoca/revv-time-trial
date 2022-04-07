import express from "express";
import { DefaultMongoDBClient, Middleware } from "@animocabrands/backend-common_library";
import { validationResult, checkSchema } from 'express-validator';
import { InvalidCompositionIdError,InvalidTyreTokenIdError,TyresNotOwnedError,NoCarInCompositionError,NoDriverInCompositionError,NotEnoughAttemptsError } from "../errors/timeTrialErrors";
import {getSeasonCollectionName,seasonMiddleware} from "../game/seasons"
import { utils } from "@animoca/f1dt-core_metadata";
import { ObjectId } from 'mongodb';
import {createIndexes} from '../database'
import { updatePools } from '../game/pool'

import {runLapForUser,getTotalAttributes} from "../game/simulator";
import {getDayStart,getFreeAttemptsForUser,getPurchasedAttemptsForUser} from "../game/state"
import {refreshLeaderboards,updateTrackBestForPlayer, updateTrackBest} from "../game/leaderboards";
import gameData from "../data/gameData";

import axios from "axios";
import { walletApiEndpoint,compositionEndpoint, sharedAttemptsBetweenSeasons } from "config";
const {extractSessionOrThrow} = Middleware;

const router = express.Router();
(async () => {
    await createIndexes(2);//2019
    await createIndexes(3);//2020
})()

const verifyTyres = async (seasonId,walletAddress,tyresTokenId) => {
    // validate that user owns tyres
    let ownedTokens = await axios({
        method: "GET",
        url: `${walletApiEndpoint}/wallet/${walletAddress}`
    });
    
    if (!ownedTokens.data[tyresTokenId])
        throw new TyresNotOwnedError();
    
    const coreMetdata = utils.getCoreMetadata(tyresTokenId);
    if (coreMetdata.type != "Tyres" || coreMetdata.seasonId != seasonId) {
        throw new InvalidTyreTokenIdError();
    }
}

const getComposition = async (season,cookie,compositionId) => {
    let response = await axios({
        method: "GET",
        url: `${compositionEndpoint}/${season}/${compositionId}`,
        headers: {
            'Cookie': cookie
        }
    });
    
    const tokens = [];
    if(!response.data.car.tokenId)throw new NoCarInCompositionError();
    tokens.push(response.data.car.tokenId);

    if(!response.data.driver.tokenId)throw new NoDriverInCompositionError();
    tokens.push(response.data.driver.tokenId);

    for(const part in response.data.parts)
        tokens.push(response.data.parts[part].tokenId);
    for(const gear in response.data.gear)
        tokens.push(response.data.gear[gear].tokenId);

    return tokens;
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

router.get("/:season(2019|2020)?/tier/:compositionId", checkSchema(compositionIdValidator));
router.get("/:season(2019|2020)?/tier/:compositionId", extractSessionOrThrow(),seasonMiddleware, async function (req, res, next)  {
    try {
        const { season, seasonId } = req;

        var validationErr = validationResult(req).mapped();
        if (validationErr.compositionId)
            throw new InvalidCompositionIdError();

        await verifyTyres(seasonId,req.session.walletAddress,req.query.tyresToken);

        const tokens = await getComposition(season,req.headers.cookie,req.params.compositionId);
        
        const totalAttributes = getTotalAttributes(tokens, req.query.tyresToken);
        const tier = gameData.getTierForAttributes(totalAttributes);
        
        res.json({tier});
    }  catch (e) {
        next(e);
    }
});

router.post("/:season(2019|2020)?/race/:compositionId", checkSchema(compositionIdValidator));
router.post("/:season(2019|2020)?/race/:compositionId",extractSessionOrThrow(), seasonMiddleware, async function (req, res, next) {
    try {
        const { season, seasonId } = req;
        
        var validationErr = validationResult(req).mapped();
        if (validationErr.compositionId)
            throw new InvalidCompositionIdError();
        
        console.log(`race ${req.session.walletAddress} ${req.params.compositionId} ${req.body.tyresToken}`);
        
        await verifyTyres(seasonId, req.session.walletAddress,req.body.tyresToken);

        const tokens = await getComposition(season,req.headers.cookie,req.params.compositionId);
        
        const collection = await DefaultMongoDBClient().getCollection(getSeasonCollectionName(seasonId,"timetrial"));
        const attemptsCollectionName = sharedAttemptsBetweenSeasons?"timetrial_attempts":getSeasonCollectionName(seasonId,"timetrial_attempts");
        const attemptsCollection = await DefaultMongoDBClient().getCollection(attemptsCollectionName);
        const loadoutsCollection = await DefaultMongoDBClient().getCollection(getSeasonCollectionName(seasonId,"timetrial_loadouts"));

        const freeAttempts = await getFreeAttemptsForUser(seasonId,req.session.walletAddress);
        const purchasedAttempts = await getPurchasedAttemptsForUser(seasonId,req.session.walletAddress);
        
        const totalAttempts = freeAttempts + purchasedAttempts;

        if(totalAttempts <= 0)
            throw new NotEnoughAttemptsError();

        
        const dayStart = getDayStart();
        const loadoutDoc = await loadoutsCollection.insertOne({dayTs:dayStart,walletAddress:req.session.walletAddress,loadout:[...tokens,req.body.tyresToken]});
        const loadout = ObjectId(loadoutDoc.insertedId);

        const lapResult = await runLapForUser(seasonId,req.session.walletAddress, tokens, req.body.tyresToken, loadout);
        lapResult.tier = gameData.getTierForAttributes(lapResult.totalAttributes);
        console.info(`race ${req.session.walletAddress} ${req.params.compositionId} ${req.body.tyresToken} ${lapResult.tier} ${JSON.stringify(lapResult)}`);
        const updatedEntries = await collection.findOneAndUpdate({walletAddress:req.session.walletAddress,tier:lapResult.tier,day:dayStart},
        {$push:{"entries":{time:lapResult.finalLapTime,score:lapResult.score,loadout}}},
        {returnOriginal:false,upsert:true});
        
        const dayEntries = updatedEntries.value;
        if(freeAttempts == 0){
            await attemptsCollection.findOneAndUpdate({ walletAddress: req.session.walletAddress,attempts:{$gte:1} }, { $inc: { attempts:-1 } },{returnOriginal:false});
            await updatePools(seasonId,dayStart);
        }
        
        if(dayEntries && dayEntries.entries && Math.min.apply(null,dayEntries.entries.map(entry=>entry.time)) == lapResult.finalLapTime)
            refreshLeaderboards(seasonId,lapResult.tier,lapResult.track,lapResult.weather,collection);

        updateTrackBestForPlayer(seasonId,lapResult.track,lapResult.weather,req.session.walletAddress,lapResult.finalLapTime);
        try{
            await updateTrackBest(seasonId,lapResult.track,lapResult.weather,req.session.walletAddress,lapResult.finalLapTime);
        }catch(e){
            console.info("updateTrackBest update failed " , e)
        }
        
        delete lapResult.totalAttributes;
        delete lapResult.track;
        delete lapResult.weather;
        delete lapResult.timestamp;
        res.json(lapResult);
    }  catch (e) {
        next(e);
    }
});


module.exports = router;
