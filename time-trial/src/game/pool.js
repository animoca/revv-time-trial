import { DefaultMongoDBClient } from "@animocabrands/backend-common_library";
import {getWeek, getWeekYear} from "../game/state"
import {poolRewardRatios,attemptPrice} from "config";

export const updatePools = async (seasonId,date) => {
    const year = getWeekYear(new Date(date));
    const week = getWeek(new Date(date));
    const poolNameNow = `${year}_${week}`;

    const nextWeekDate = new Date(date);
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);

    const yearNext = getWeekYear(nextWeekDate);
    const weekNext = getWeek(nextWeekDate);
    const poolNameNextWeek = `${yearNext}_${weekNext}`;

    const amount = Number(attemptPrice);

    const poolCollection = await DefaultMongoDBClient().getCollection("timetrial_erc20_pools");
     
    await poolCollection.findOneAndUpdate({ name: poolNameNow, seasonId }, { $inc: { total: (amount * poolRewardRatios.current) } }, { upsert: true })
    await poolCollection.findOneAndUpdate({ name: poolNameNextWeek, seasonId }, { $inc: { total: (amount * poolRewardRatios.next) } }, { upsert: true })
}
