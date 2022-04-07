import { DefaultMongoDBClient } from "@animocabrands/backend-common_library";
import gameData from "../data/gameData";
import { GameStateNotFoundError } from "../errors/timeTrialErrors";
import seedrandom from 'seedrandom';
import { stateOffsetInDays, sharedAttemptsBetweenSeasons } from "config";

import { getSeasonCollectionName } from "./seasons"

function getWeek(date) {
    if(!date) date = new Date();
    else date = new Date(date);
     var dayn = (date.getDay() + 6) % 7;
     date.setDate(date.getDate() - dayn + 3);
     var firstThursday = date.valueOf();
     date.setMonth(0, 1);
     if (date.getDay() !== 4)
      date.setMonth(0, 1 + ((4 - date.getDay()) + 7) % 7);
        
     return 1 + Math.ceil((firstThursday - date) / 604800000);
  }

function getWeekYear(date){
    if(!date) date = new Date();
    else date = new Date(date);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    return date.getFullYear();
}

const getDayStart = (date) => {
    if(!date) date = new Date();
    else date = new Date(date);
    return date.setHours(0, 0, 0, 0)
  }

const getDayOfWeek = (date) => { // monday = 0
    if(!date) date = new Date();
    else date = new Date(date);
    let day = date.getDay() - 1
    if(day < 0)day = 6;
    return day
}
const getStartOfWeek = (date) => {
    if(!date) date = new Date();
    else date = new Date(date);
    var day = getDayOfWeek(date)
    var prevMonday = new Date(date);
    if(day != 0)
        prevMonday.setDate(date.getDate() - day);
    return getDayStart(new Date(prevMonday));
}
const getStateTomorrow = async (seasonId) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return await getState(seasonId,tomorrow);
}
const getRandomTrackAndWeather = (seasonId, dayTs) => {
    const rng = seedrandom((seasonId == 2) ? "state_rng_seed" : `state_rng_seed_${seasonId}`);
    var trackIndex=0,weatherIndex=0;
    
    const startDate = new Date(Date.UTC(2020, 3, 12));
    startDate.setDate(startDate.getDate() - stateOffsetInDays);

    const rngIterationCount = Math.round(Math.abs((dayTs - startDate) / (24 * 60 * 60 * 1000)));
    for(var i=0;i<=rngIterationCount;i++){
        trackIndex = (trackIndex + 1 + Math.floor(rng() * (gameData.trackIds.length-1)))%gameData.trackIds.length;
        weatherIndex = (weatherIndex + 1 + Math.floor(rng() * (gameData.weatherIds.length-1)))%gameData.weatherIds.length;
    }
    const track = gameData.trackIds[trackIndex];
    const weather = gameData.weatherIds[weatherIndex];
    
    return {track,weather};
}

const getState = async (seasonId, date) => {
    if(!date) date = new Date();
    const dayTs = getDayStart(date);
    const col = await DefaultMongoDBClient().getCollection(getSeasonCollectionName(seasonId,"timetrial_state"));

    //random track and weather if no entry available in db
    const {track,weather} = getRandomTrackAndWeather(seasonId,dayTs);
    const state = await col.findOneAndUpdate(
        { dayTs },
        { $setOnInsert: { weather, track }},
        {projection: { _id: 0, track: 1, weather:1 },returnOriginal:false, upsert: true})
    
    if(state && state.value)
        return state.value;
    else throw new GameStateNotFoundError();
}
const getStatesForWeek = async (seasonId) => {
    const day = getDayOfWeek();
    const week = getWeek(); 
    const year = getWeekYear();
    const days = [...new Array(day+1)].map((_,i)=>i);
    const dayStates = {};
    for (const d of days){
        const date = new Date();
        date.setDate(date.getDate() - (day-d));
        dayStates[`/${year}/${week}/${d}`] = await getState(seasonId, date);
    }

    return dayStates;
}

const getFreeAttemptsForUser = async (seasonId, walletAddress) => {
    
    var totalAttemptsToday = 0; 
    const seasonsToCount = sharedAttemptsBetweenSeasons?[2,3]:[seasonId];
    
    for(var season of seasonsToCount){
        const collection = await DefaultMongoDBClient().getCollection(getSeasonCollectionName(season,"timetrial"));
        const result = await collection.aggregate(
            [
                { $match: {walletAddress,day : getDayStart()} },
                { $project:{_id:0,numberOfEntries:{$size:"$entries"}} },
                { $group : {
                    _id: null,
                    count: { $sum: "$numberOfEntries" }
                }}
            ])

            if(result)
            {
                const resultArray = await result.toArray()
                if(resultArray && resultArray.length)
                    totalAttemptsToday += resultArray[0].count;
            }
    }
    return Math.max(0,gameData.freeAttemptsPerDay - totalAttemptsToday)
}

const getPurchasedAttemptsForUser = async (seasonId, walletAddress) => {
    const collectionName = sharedAttemptsBetweenSeasons?"timetrial_attempts":getSeasonCollectionName(seasonId,"timetrial_attempts");
    const collection = await DefaultMongoDBClient().getCollection(collectionName);
    let attempts = await collection.findOne({ walletAddress }, { $projection: { _id:0,attempts:1 } });
    if(!attempts)attempts = 0;
    else attempts = attempts.attempts
    return attempts
}

export{
    getWeek,
    getWeekYear,
    getDayStart,
    getDayOfWeek,
    getStartOfWeek,
    getState,
    getStateTomorrow,
    getStatesForWeek,
    getFreeAttemptsForUser,
    getPurchasedAttemptsForUser,
    getRandomTrackAndWeather
}
