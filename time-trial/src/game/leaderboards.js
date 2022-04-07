import { DefaultMongoDBClient } from "@animocabrands/backend-common_library";
import {getDayStart, getWeek, getWeekYear, getStartOfWeek, getDayOfWeek, getState} from "./state"
import { LeaderboardNotFoundError } from "../errors/timeTrialErrors";
import { getSeasonCollectionName } from "../game/seasons"

const getCurrentLeaderboardURLs = (season) => {
    const day = getDayOfWeek();
    const week = getWeek();
    const year = getWeekYear();
    const days = [...new Array(day+1)].map((_,i)=>i);
    const lbs = {daily:days.map(d => `/${year}/${week}/${d}`)};
    
    const date = new Date();
    date.setDate(date.getDate()-7);
    const lastYear = getWeekYear(date);
    const lastWeek = getWeek(date);
    lbs.weekly=[`/${lastYear}/${lastWeek}`,`/${year}/${week}`];
    return lbs;
}
const refreshDailyLeaderboard = async (seasonId,tier,timeTrialCollection) => {
    if(!timeTrialCollection)
        timeTrialCollection = await DefaultMongoDBClient().getCollection(getSeasonCollectionName(seasonId,"timetrial"));


    const result = await timeTrialCollection.aggregate(
        [
            { $match: {day:getDayStart(),tier} },
            { $unwind: "$entries"},
            {
                $group:{
                    _id:"$walletAddress",
                    time:{$min:"$entries.time"},
                    score:{$max:"$entries.score"}
                }
            },
            { $lookup:{from:"users",localField: "_id",foreignField:"walletAddress",as:"user"}},
            { $unwind : {path:"$user",preserveNullAndEmptyArrays:true}},
            { $sort : { time : 1 } },
            { $project:{_id:0,walletAddress:"$_id",time:1,score:1,nickname:"$user.nickname"} }
        ])

    const entries = await result.toArray();
    const rankedEntries = entries.map((entry,index)=>{
        return {...entry,rank:(index+1)}
    })

    
    const day = getDayOfWeek();
    const week = getWeek();
    const year = getWeekYear();
    const name = `${tier}_${year}_${week}_${day}`;
    const collection = await DefaultMongoDBClient().getCollection(getSeasonCollectionName(seasonId,'timetrial_leaderboards'));
    collection.findOneAndUpdate({name},{$set:{entries:rankedEntries}},{upsert:true,returnOriginal:false});
}

const refreshWeeklyLeaderboard = async (seasonId,tier,timeTrialCollection) => {
    if(!timeTrialCollection)
        timeTrialCollection = await DefaultMongoDBClient().getCollection(getSeasonCollectionName(seasonId,"timetrial"));
    
    const result = await timeTrialCollection.aggregate(
        [
            { $match: {day:{$gte:getStartOfWeek()},ignored:{$exists:false},tier} },
            { $unwind: "$entries"},
            {
                $group:{
                    _id:{"walletAddress":"$walletAddress","day":"$day"},
                    score:{$max:"$entries.score"}
                }
            },
            {
                $group:{
                    _id:"$_id.walletAddress",
                    score:{$sum:"$score"}
                }
            },
            { $lookup:{from:"users",localField: "_id",foreignField:"walletAddress",as:"user"}},
            { $unwind : {path:"$user",preserveNullAndEmptyArrays:true}},
            { $sort : { score : -1 } },
            { $project:{_id:0,day:"$_id.day",walletAddress:"$_id",score:1,nickname:"$user.nickname"} }
        ]);

    const entries = await result.toArray();
    const rankedEntries = entries.map((entry,index)=>{
        return {...entry,rank:(index+1)}
    });
    
    const week = getWeek();
    const year = getWeekYear();
    const name = `${tier}_${year}_${week}`;
    const collection = await DefaultMongoDBClient().getCollection(getSeasonCollectionName(seasonId,'timetrial_leaderboards'));
    collection.findOneAndUpdate({name},{$set:{entries:rankedEntries}},{upsert:true,returnOriginal:false});
}

const updateTrackBestForPlayer = async(seasonId,track,weather,walletAddress,time) => {
    const collection = await DefaultMongoDBClient().getCollection(getSeasonCollectionName(seasonId,"timetrial_track_personal_bests"));
    await collection.updateOne({track,weather,walletAddress},{$min:{time}},{upsert:true,returnOriginal:false});
}

const getTrackBestForPlayer = async(seasonId,track,weather,walletAddress) => {
    const collection = await DefaultMongoDBClient().getCollection(getSeasonCollectionName(seasonId,"timetrial_track_personal_bests"));
    const result = await collection.findOne({track,weather,walletAddress},{projection:{_id:0,time:1}});
    return result;
}

const updateTrackBest = async(seasonId,track,weather,walletAddress,time) => {
    const collection = await DefaultMongoDBClient().getCollection(getSeasonCollectionName(seasonId,"timetrial_track_bests"));
    try{
        await collection.updateOne({track,weather,time:{$gt:time}},{$set:{walletAddress,time}},{upsert:true,returnOriginal:false});    
    }catch(e){

    }
}

const getTrackBest = async(seasonId,track,weather) => {
    const collection = await DefaultMongoDBClient().getCollection(getSeasonCollectionName(seasonId,"timetrial_track_bests"));
    const result = await collection.findOne({track,weather},{projection:{_id:0,time:1,walletAddress:1}});
    if(result){
        const usersCollection = await DefaultMongoDBClient().getCollection("users");
        const user = await usersCollection.findOne({ walletAddress:result.walletAddress });
        return {...result,nickname:user.nickname};
    }
    return {};
}

const getDailyLeaderboard = async (seasonId,limit,tier,walletAddress,year,week,day) => {
    if(!day){
        day = getDayOfWeek();
        week = getWeek();
        year = getWeekYear();
    }
    
    const name = `${tier}_${year}_${week}_${day}`
    const collection = await DefaultMongoDBClient().getCollection(getSeasonCollectionName(seasonId,"timetrial_leaderboards"));

    if(!limit){
        const result = await collection.findOne({name});
        if(result && result.entries)
            return result.entries;
    }
    else{
        const result = await collection.aggregate(
        [
            { $match: {name}},
            {$project: {_id:0,
                    entries: {
                       $filter: {
                          input: "$entries",
                          as: "entry",
                          cond: { $or:[{$lte: [ "$$entry.rank", limit ]},{$eq:["$$entry.walletAddress",walletAddress]}] }
                       }
                    }
                 }    
            }
        ]);

        if(result){
            const obj = await result.toArray();
            if(obj[0] && obj[0].entries)
                return obj[0].entries;
        }
    }
    
    throw new LeaderboardNotFoundError(name);
    
}

const getDailyBestForUser = async (seasonId,walletAddress) => {
    const timeTrialCollection = await DefaultMongoDBClient().getCollection(getSeasonCollectionName(seasonId,"timetrial"));

    const result = await timeTrialCollection.aggregate(
        [
            { $match: {day:getDayStart(),walletAddress} },
            { $unwind: "$entries"},
            {
                $group:{
                    _id:"$walletAddress",
                    time:{$min:"$entries.time"}
                }
            },
            { $project:{_id:0,time:1} }
        ])

    const entries = await result.toArray();
    return entries[0]?entries[0]:{};
}
const getTrackLeaderboard = async (seasonId,limit,walletAddress) => {
    const state = await getState(seasonId);
    const name = `${state.track}_${state.weather}`
    const collection = await DefaultMongoDBClient().getCollection(getSeasonCollectionName(seasonId,"timetrial_leaderboards"));
    if(!limit){
        const result = await collection.findOne({name});
        if(result && result.entries)
            return result.entries;
    }else{
        const result = await collection.aggregate(
            [
                { $match: {name}},
                {$project: {_id:0,
                        entries: {
                        $filter: {
                            input: "$entries",
                            as: "entry",
                            cond: { $or:[{$lte: [ "$$entry.rank", limit ]},{$eq:["$$entry.walletAddress",walletAddress]}] }
                        }
                        }
                    }    
                }
                
            ]);
        if(result){
            const obj = await result.toArray();
            if(obj[0] && obj[0].entries)
                return obj[0].entries;
        }
    }
}

const getWeeklyLeaderboard = async (seasonId,limit,tier,walletAddress,year,week) => {
    if(!week){
        week = getWeek();
        year = getWeekYear();
    }
    
    const name = `${tier}_${year}_${week}`
    const collection = await DefaultMongoDBClient().getCollection(getSeasonCollectionName(seasonId,"timetrial_leaderboards"));

    if(!limit){
        const result = await collection.findOne({name});
        if(result && result.entries){
            result.entries.forEach(entry=>{
                entry.score = entry.score.toFixed(2);
            })
            return result.entries;
        }
    }else{
        const result = await collection.aggregate(
            [
                { $match: {name}},
                {$project: {_id:0,
                        entries: {
                        $filter: {
                            input: "$entries",
                            as: "entry",
                            cond: { $or:[{$lte: [ "$$entry.rank", limit ]},{$eq:["$$entry.walletAddress",walletAddress]}] }
                        }
                        }
                    }    
                }
                
            ]);
        if(result){
            const obj = await result.toArray();
            if(obj[0] && obj[0].entries){
                obj[0].entries.forEach(entry=>{
                    entry.score = entry.score.toFixed(2);
                })
                return obj[0].entries;
            }
        }
    }
    throw new LeaderboardNotFoundError(name);
    
}

const refreshLeaderboards = (seasonId,tier,track,weather,timeTrialCollection) => {
    console.log("Leaderboard Refresh");
    refreshDailyLeaderboard(seasonId,tier,timeTrialCollection);
    refreshWeeklyLeaderboard(seasonId,tier,timeTrialCollection);
}
export {refreshLeaderboards,getDailyLeaderboard,getWeeklyLeaderboard,getCurrentLeaderboardURLs,getDailyBestForUser,getTrackLeaderboard,updateTrackBestForPlayer,updateTrackBest,getTrackBestForPlayer,getTrackBest}