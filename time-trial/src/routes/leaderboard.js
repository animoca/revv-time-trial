import express from "express";
import {getDailyLeaderboard, getWeeklyLeaderboard,getCurrentLeaderboardURLs,getTrackBestForPlayer, getTrackBest} from "../game/leaderboards";
import {getState} from "../game/state"
import { checkSchema } from 'express-validator';
import { Middleware } from "@animocabrands/backend-common_library";
import { seasonMiddleware } from "../game/seasons"

const router = express.Router();
const {extractSessionOrThrow} = Middleware;

router.get("/:season(2019|2020)?/leaderboard/",seasonMiddleware,   async function (req, res, next) {
    try {
        const {season} = req;
        res.json(getCurrentLeaderboardURLs(season));
    } catch (e) {
        next(e);
    }
});

router.get("/:season(2019|2020)?/leaderboard/pb",extractSessionOrThrow(),seasonMiddleware, async function (req, res, next) {
    try {
        const { seasonId } = req;
        const state = await getState(seasonId);
        const result = await getTrackBestForPlayer(seasonId,state.track,state.weather,req.session.walletAddress);
        res.json(result);
    } catch (e) {
        next(e);
    }
});
router.get("/:season(2019|2020)?/leaderboard/best", seasonMiddleware, async function (req, res, next) {
    try {
        const { seasonId } = req;
        const state = await getState(seasonId);
        const result = await getTrackBest(seasonId,state.track,state.weather);
        res.json(result);
    } catch (e) {
        next(e);
    }
});


const limitValidator = {
    limit: {
      in: ['query'],
      isInt: true,
      toInt:true
      }
}
router.get("/:season(2019|2020)?/leaderboard/daily/:tier/:year?/:week?/:day?", checkSchema(limitValidator), seasonMiddleware, async function (req, res, next) {
    try {
        const { seasonId } = req;
        const result = await getDailyLeaderboard(seasonId,req.query.limit,req.params.tier,req.query.walletAddress,req.params.year,req.params.week,req.params.day);
        res.json(result);
    } catch (e) {
        next(e);
    }
});

router.get("/:season(2019|2020)?/leaderboard/weekly/:tier/:year?/:week?", checkSchema(limitValidator), seasonMiddleware, async function (req, res, next) {
    try {
        const { seasonId } = req;
        const result = await getWeeklyLeaderboard(seasonId,req.query.limit,req.params.tier,req.query.walletAddress,req.params.year,req.params.week);
        res.json(result);
    } catch (e) {
        next(e);
    }
});

module.exports = router;