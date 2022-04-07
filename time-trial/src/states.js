import {getRandomTrackAndWeather} from './game/state.js'
import gameData from "./data/gameData";

(async ()=>{
await gameData.init();
const forecast_count = 15;
let date = new Date();
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
console.log(`\n\n 2019 Season:\n\n`);
for(var i=0;i<forecast_count;i++){
    const dayTs = (new Date(date)).setUTCHours(0,0,0,0);
    const {track,weather} = getRandomTrackAndWeather(2,dayTs);
    const formattedDate = date.toLocaleDateString('en-US', options);
    console.log({date:formattedDate,dayTs,track,weather});
    date.setDate(date.getDate() + 1);
}

date = new Date();
console.log(`\n\n 2020 Season:\n\n`);
for(var i=0;i<forecast_count;i++){
    const dayTs = (new Date(date)).setUTCHours(0,0,0,0);
    const {track,weather} = getRandomTrackAndWeather(3,dayTs);
    const formattedDate = date.toLocaleDateString('en-US', options);
    console.log({date:formattedDate,dayTs,track,weather});
    date.setDate(date.getDate() + 1);
}
})()