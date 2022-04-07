import express from "express";
import { Middleware } from "@animocabrands/backend-common_library";
import { getFreeAttemptsForUser,getPurchasedAttemptsForUser } from "../game/state";
import {getState,getStateTomorrow,getStatesForWeek} from "../game/state"
import { seasonMiddleware } from "../game/seasons"

const router = express.Router();
const {extractSessionOrThrow} = Middleware;

router.get('/ping', function(req, res, next) {
    res.json({response: "pong"});
});

router.get("/:season(2019|2020)?/status", seasonMiddleware, async function (req, res) {
    const state = await getState(req.seasonId);
    state.next = await getStateTomorrow(req.seasonId);
    state.week = await getStatesForWeek(req.seasonId);
    res.json(state);
});

router.get("/:season(2019|2020)?/profile", extractSessionOrThrow(), seasonMiddleware, async function (req, res, next) {
    try {
        const freeAttempts = await getFreeAttemptsForUser(req.seasonId, req.session.walletAddress);
        const attempts = await getPurchasedAttemptsForUser(req.seasonId, req.session.walletAddress);

        res.json({
            freeAttempts,
            attempts
        });
    } catch (e) {
        next(e)
    }
});


module.exports = router;
