import express from "express";
import { DefaultMongoDBClient } from "@animocabrands/backend-common_library";
import {getWeek, getWeekYear} from "../game/state"
import {revvPoolDefaultAmount,revvPoolFixedAmount} from "config";
import {seasonMiddleware} from "../game/seasons"


const router = express.Router();

router.get("/:season(2019|2020)?/pool",seasonMiddleware, async function (req, res, next) {
    try {
        const { seasonId } = req;
        const year = getWeekYear();
        const week = getWeek();
        const name = `${year}_${week}`;
        const collection = await DefaultMongoDBClient().getCollection("timetrial_pools");
        const result = await collection.findOne({name,seasonId},{ projection:{_id:0,total:1 }})
        const total = result?result.total:0;

        const erc20Collection = await DefaultMongoDBClient().getCollection("timetrial_erc20_pools");
        const revvResult = await erc20Collection.findOne({name,seasonId},{ projection:{_id:0,total:1 }})
        var revvTotal = Number(revvResult?revvResult.total:0)+Number(revvPoolDefaultAmount);

        if(revvPoolFixedAmount && revvPoolFixedAmount>0)
            revvTotal = revvPoolFixedAmount;

        res.json({eth:total,revv:revvTotal});
        } catch (e) {
            next(e)
        }
    });

module.exports = router;
