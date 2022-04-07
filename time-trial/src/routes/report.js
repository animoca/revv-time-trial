import express from "express";
import { DefaultMongoDBClient } from "@animocabrands/backend-common_library";
import {getWeek, getWeekYear, getStartOfWeek} from "../game/state"
import {getWeeklyLeaderboard} from "../game/leaderboards"
import { seasonMiddleware, getSeasonCollectionName } from "../game/seasons"

import { reportApiUserCredentials, reportApiDefaultLeaderboardLimit, reportApiLeaderboardMaxLimit } from "config";
const basicAuth = require('express-basic-auth')
const router = express.Router();
import {ObjectId} from 'mongodb';

function getDateFromWeekNumber(w, y) {
    var simple = new Date(y, 0, 1 + (w - 1) * 7);
    var dow = simple.getDay();
    var ISOweekStart = simple;
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
}

const generateReport = async (seasonId, limit, w, y) => {
    let lastWeekDate = new Date();
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);
    if(w && y)
        lastWeekDate = getDateFromWeekNumber(w,y);
    const prevMondayDayTs = getStartOfWeek(lastWeekDate);
    let currentWeekStartDayTs = getStartOfWeek();
    if(w && y){
        lastWeekDate.setDate(lastWeekDate.getDate() + 7);
        currentWeekStartDayTs = getStartOfWeek(lastWeekDate);
    }

    const week = getWeek(prevMondayDayTs);
    const year = getWeekYear(prevMondayDayTs);
    const collection = await DefaultMongoDBClient().getCollection(getSeasonCollectionName(seasonId,"timetrial"));
    const tierwiseResult = await collection.aggregate([{$match:{day:{$lt:currentWeekStartDayTs,$gte:prevMondayDayTs}}},
        {$project:{walletAddress:"$walletAddress",tier:"$tier",total:{$size:"$entries"}}},
        {$group:{_id:"$tier",count:{$sum:"$total"}}}])
    const tierwiseArr = await tierwiseResult.toArray();
    
    const tiers = [];
    const tierwiseBreakdown = {};
    tierwiseArr.forEach(entry=>{
        tiers.push(entry._id);
        tierwiseBreakdown[entry._id] = entry.count;
    })
    
    const usageClassResult = await collection.aggregate([{$match:{day:{$lt:currentWeekStartDayTs,$gte:prevMondayDayTs}}},
        {$project:{walletAddress:"$walletAddress",total:{$add:[{$size:"$entries"},-1]}}},
        {$group:{_id:"$walletAddress",count:{$sum:"$total"}}},
        {$match:{count:{$gt:0}}},
        {$project:{walletAddress:"$_id",attempts:{$floor:{$log10:"$count"}}}},
        {$group:{_id:"$attempts",wallets:{$addToSet:"$walletAddress"}}},
        {$project:{category:{$pow:[10,"$_id"]},wallets:{$size:"$wallets"}}},
    ])
    const usageClasses = (await usageClassResult.toArray()).sort((a,b)=>a.wallets-b.wallets);

    const totalUniqueResult = await collection.aggregate([{$match:{day:{$lt:currentWeekStartDayTs,$gte:prevMondayDayTs}}},{$group:{_id:"$walletAddress"}},{$group:{_id:null,count:{$sum:1}}}])
    const totalUniqueArr = await totalUniqueResult.toArray();
    const totalUniquePlayers = (totalUniqueArr && totalUniqueArr[0])?totalUniqueArr[0].count:"NA";

    const leaderboards = {};
    tiers.forEach(tier => leaderboards[tier]=[]);
    for(var i=0;i<tiers.length;i++){
            leaderboards[tiers[i]] = await getWeeklyLeaderboard(seasonId,limit,tiers[i],null,year,week);
    }

    const erc20PoolsCollection = await DefaultMongoDBClient().getCollection("timetrial_erc20_pools");
    const revPoolData = await erc20PoolsCollection.findOne({name:`${year}_${week}`,seasonId});
    const revvPool = revPoolData?revPoolData.total : "NA"

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const startDate = new Date(prevMondayDayTs).toLocaleDateString('en-US', options);
    const endDate = new Date(currentWeekStartDayTs).toLocaleDateString('en-US', options);

    return {seasonId,startTs:prevMondayDayTs,endTs:currentWeekStartDayTs,startDate,endDate,week,year,tierwiseBreakdown,usageClasses,totalUniquePlayers,revvPool,leaderboards}

}

const getReportHtml = (params) => {
    const {seasonId,startTs,endTs,startDate,endDate,week,year,tierwiseBreakdown,totalUniquePlayers,usageClasses,revvPool,leaderboards} = params;
    const tiers = Object.keys(leaderboards).sort();
    let lbView = "<h2/>Standings</h2>";
    tiers.forEach(tier => {
        lbView += `<h3>Tier ${tier}</h3>`
        lbView += `<table/>`;
        if(leaderboards[tier])
            leaderboards[tier].forEach(entry => {
                lbView += `<p>
                <b/>${entry.rank}</b> • ${entry.walletAddress} • ${entry.nickname} • ${entry.score}
                </p>`;
            })
        lbView += "</table>"
    });

    let tiersView =  "<h3/>Attempts By Tier</h3>";
    tiers.forEach(tier => {
        tiersView += `<table/>`;
        tiersView += `
        <b/>${tier}</b> ${tierwiseBreakdown[tier]}`;
        tiersView += "</table>"
    });

    let uasgeView =  "<h3/>Number of users by attempts consumed</h3>";
    usageClasses.forEach(entry => {
        uasgeView += `
        <b/> >=${entry.category}</b> (${entry.wallets}) <br/>`;
    });

    return `<!DOCTYPE html>
    <html>
    <head><title>${year} Week ${week} Report : REVV Time Trial</title></head>
    <body>
    <h1>${year} Week ${week} Report (Season ${seasonId==2?"2019":"2020"})</h1>
    <h5>${startDate} → ${endDate}</h5>
    <hr align="left" style="width:100%;">
    <h2>Players</h2>
    ${tiersView}
    <br/>
    ${uasgeView}
    <hr align="left" style="width:150px;">
    <p>→ <b>Total Unique Players: </b>${totalUniquePlayers}</p>
    <p>→ <b>Rev Pool @70%: </b>${revvPool}</p>
    <hr align="left" style="width:300px;">
    ${lbView}
    </body>
    </html>
    `
}

const generatePurchaseReport = async (w,y) => {
    const collection = await DefaultMongoDBClient().getCollection("timetrial_purchases");
    let cursor;
    if(w && y){
        const start = getDateFromWeekNumber(w,y);
        const dateEnd = new Date(start);
        dateEnd.setDate(dateEnd.getDate() + 7);
        const end = new Date(getStartOfWeek(dateEnd));
        cursor = await collection.find({_id:{$gte:ObjectId.createFromTime(start.getTime()/1000),
            $lt:ObjectId.createFromTime(end.getTime()/1000)}})
    }else cursor = await collection.find({});
    
    const weeklyData = {};
    while (await cursor.hasNext()) {
        const entry = await cursor.next();
        const timestamp = ObjectId(entry._id).getTimestamp();
        const startTs = getStartOfWeek(timestamp);
        const dateEnd = new Date(timestamp);
        dateEnd.setDate(dateEnd.getDate() + 7);
        const endTs = getStartOfWeek(dateEnd);
        const week = getWeek(timestamp);
        const year = getWeekYear(timestamp);
        const address = entry.destination;
        const id = startTs;

        if(!weeklyData[id])
            weeklyData[id]={week,year,startTs,endTs,wallets:{}}
        
        if(!weeklyData[id].wallets[address])
            weeklyData[id].wallets[address]=0;

        weeklyData[id].wallets[address] = weeklyData[id].wallets[address] + Number(entry.quantity);
    }
    const sortedKeys = Object.keys(weeklyData).sort((a,b)=>a<b?1:-1);
    const data =[];
    sortedKeys.forEach(key => data.push(weeklyData[key]))

    data.forEach(entry => {
        entry.total = Object.values(entry.wallets).reduce((acc,entry)=>acc+entry,0);
        entry.count = Object.keys(entry.wallets).length;
    })

    return data;
}

const getPurchaseReportHtml = (data) => {
    const getWeekHtml = (weekData) =>{
        const {week,year,startTs,endTs,wallets,total,count} = weekData;
        let weekView =  `<h2/>${year}, Week ${week}</h2>`;
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const startDate = new Date(startTs).toLocaleDateString('en-US', options);
        const endDate = new Date(endTs).toLocaleDateString('en-US', options);
        weekView +=  `<h5>${startDate} → ${endDate}</h5>`;
        weekView += `<p>→ <b>Total Tries Purchased: </b>${total}</p>`
        weekView += `<p>→ <b>Unique Buyers: </b>${count}</p>`
        weekView += `<table/>`
        Object.keys(wallets).forEach(address => {
            weekView += `<tr/><td/>${address}</td><td/><b/>${wallets[address]}</b></td></tr>`
        });
        weekView += `</table>`
        weekView += `<hr align="left" style="width:150px;">`
        return weekView;
    }
    
    const view = data.reduce((view,weekData)=>view + getWeekHtml(weekData),"");
    

    return `<!DOCTYPE html>
    <html>
    <head><title>Purchases Report : Time Trial</title></head>
    <body>
    <h1>Time Trial Attempts Purchases Report</h1>
    ${view}
    </body>
    </html>
    `
}

const reportAuthMiddleware = basicAuth({
    users: reportApiUserCredentials,
    challenge: true});

router.get("/:season(2019|2020)?/report",reportAuthMiddleware,seasonMiddleware, async function (req, res, next) {
    try {
            const limit = Math.max(1,Math.min(Number(req.query.top) || reportApiDefaultLeaderboardLimit,reportApiLeaderboardMaxLimit));
            const report = await generateReport(req.seasonId,limit);
            if(req.query.json){
                res.set('Content-Type', 'application/json');
                res.json(report);
            }else{
                res.set('Content-Type', 'text/html');
                res.send(getReportHtml(report));
            }
        } catch (e) {
            next(e)
        }
});


router.get("/:season(2019|2020)?/report/:year/:week",reportAuthMiddleware,seasonMiddleware, async function (req, res, next) {
    try {
            const limit = Math.max(1,Math.min(Number(req.query.top) || reportApiDefaultLeaderboardLimit,reportApiLeaderboardMaxLimit));
            const report = await generateReport(req.seasonId,limit,req.params.week,req.params.year);
            if(req.query.json){
                res.set('Content-Type', 'application/json');
                res.json(report);
            }else{
                res.set('Content-Type', 'text/html');
                res.send(getReportHtml(report));
            }

        } catch (e) {
            next(e)
        }
});


router.get("/report/purchases",reportAuthMiddleware,seasonMiddleware, async function (req, res, next) {
    try {
            const report = await generatePurchaseReport();
            if(req.query.json){
                res.set('Content-Type', 'application/json');
                res.json(report);
            }else{
                res.set('Content-Type', 'text/html');
                res.send(getPurchaseReportHtml(report));
            }
        } catch (e) {
            next(e)
        }
});


router.get("/report/purchases/:year/:week",reportAuthMiddleware,seasonMiddleware, async function (req, res, next) {
    try {
            const report = await generatePurchaseReport(req.params.week,req.params.year);
            if(req.query.json){
                res.set('Content-Type', 'application/json');
                res.json(report);
            }else{
                res.set('Content-Type', 'text/html');
                res.send(getPurchaseReportHtml(report));
            }

        } catch (e) {
            next(e)
        }
});


module.exports = router;
