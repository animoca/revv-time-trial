import {getState} from "./state"

const bits = require("bits.js");
const BigInteger = require("big-integer");
import seedrandom from 'seedrandom';

import gameData from "../data/gameData";

import { MMTPropertiesLayout, TokenTypes } from "../data/constants";

const getLapTime = (finalAttributes, trackId, seed) => {
    const track = gameData.tracks[trackId];
    
    const varianceLow =  (1 -  track.randomness);
    const varianceHigh =  (1 +  track.randomness);
    const variance = varianceHigh - varianceLow;

    let lapTime = track.time.min + (track.time.max - track.time.min) / Math.pow( ( (Math.round(finalAttributes) - track.attributes.min) * track.scoreCoefficient + 1 ), track.power);
    
    lapTime *= ((variance * seedrandom(seed)()) + varianceLow);

    return Math.round(lapTime);
}

const calculateTotalAttributes = (tokens) => {
        let total = 0;
        for (const index in tokens) {
            total += tokens[index].stats.stat1;
            total += tokens[index].stats.stat2;
            total += tokens[index].stats.stat3;
        }
        return total;
}

const calculateFinalAttributes = (tokens, trackId, weatherId, tyreType) => {
    if (!gameData.tracks[trackId]) {
        console.error(`unknown track id ${trackId}`);
    }
    
    const primaryAttribute = gameData.tracks[trackId].primaryAttribute;
    
    const circuitMod = gameData.tyresCircuitModifiers[tyreType][primaryAttribute];
    
    let stats = {
        topSpeed: 0,
        acceleration: 0,
        grip: 0,
        stamina: 0,
        aggression: 0,
        concentration: 0 
    };

    for (const index in tokens) {
        const token = tokens[index];
        const type = token.type;

        let stat1 = token.stats.stat1;
        let stat2 = token.stats.stat2;
        let stat3 = token.stats.stat3;

        if (stat1 === undefined) {
            stat1 = token.stats[0];
            stat2 = token.stats[1];
            stat3 = token.stats[2];
        }

        if (type == TokenTypes.Tyres || type == TokenTypes.Car) {
            stat1 = Math.round(circuitMod * stat1);
            stat2 = Math.round(circuitMod * stat2);
            stat3 = Math.round(circuitMod * stat3);

            if (type == TokenTypes.Tyres) {
                const tyres = token.subType;
                // modify tyres attributes
                const weatherMods = gameData.tyresWeatherModifiers[tyres][weatherId];
                stat1 = Math.round(stat1 * weatherMods.topSpeed);
                stat2 = Math.round(stat2 * weatherMods.acceleration);
                stat3 = Math.round(stat3 * weatherMods.grip);

                const cap = (gameData.tyresWeatherCaps[tyres][weatherId]/100);
                stat1 = Math.round(stat1 * cap);
                stat2 = Math.round(stat2 * cap);
                stat3 = Math.round(stat3 * cap);
            }
        }
        
        switch (type) {
            case TokenTypes.Car:
            case TokenTypes.Part:
            case TokenTypes.Tyres:
                stats.topSpeed += stat1;
                stats.acceleration += stat2;
                stats.grip += stat3;
                break;

            case TokenTypes.Driver:
            case TokenTypes.Gear:
                stats.stamina += stat1;
                stats.aggression += stat2;
                stats.concentration += stat3;
                break;
        }
    }

    let finalAttributes = 0;
    const trackAttributes = gameData.trackAttributes[trackId];
    finalAttributes += trackAttributes.topSpeed * stats.topSpeed;
    finalAttributes += trackAttributes.acceleration * stats.acceleration;
    finalAttributes += trackAttributes.grip * stats.grip;
    finalAttributes += trackAttributes.stamina * stats.stamina; 
    finalAttributes += trackAttributes.aggression * stats.aggression;
    finalAttributes += trackAttributes.concentration * stats.concentration;
    return Math.round(finalAttributes);
}

const getConvertedTokens = (tokens, tyres) => {
    let convertedTokens = [];
    for (const token of tokens) {
        let unpackedAttributes = bits.decode(MMTPropertiesLayout, BigInteger(token));
        convertedTokens.push({
            type: Number(unpackedAttributes.type),
            subType: Number(unpackedAttributes.subType),
            stats: {
                stat1: Number(unpackedAttributes.stat1),
                stat2: Number(unpackedAttributes.stat2),
                stat3: Number(unpackedAttributes.stat3)
            }
        });
    }

    let tyreType = 0;
    {
        let unpackedAttributes = bits.decode(MMTPropertiesLayout, BigInteger(tyres));
        convertedTokens.push({
            type: Number(unpackedAttributes.type),
            subType: Number(unpackedAttributes.subType),
            stats: {
                stat1: Number(unpackedAttributes.stat1),
                stat2: Number(unpackedAttributes.stat2),
                stat3: Number(unpackedAttributes.stat3)
            }
        });
        tyreType = Number(unpackedAttributes.subType);
    }
    return {convertedTokens,tyreType};
}

const simulate = (tokens, tyres, trackId, weatherId, seed) =>  {
    
    const {convertedTokens,tyreType} = getConvertedTokens(tokens,tyres);
    
    const finalAttributes = calculateFinalAttributes(convertedTokens, trackId, weatherId, tyreType);
    const totalAttributes = calculateTotalAttributes(convertedTokens);

    const result = {};
    result.totalAttributes = totalAttributes;
    result.finalLapTime = getLapTime(finalAttributes, trackId, seed);
    result.track = trackId;
    result.weather = weatherId;
    result.score = 100 + (gameData.tracks[trackId].record - result.finalLapTime) / 300;
    result.score = (Math.max(0, result.score));

    return result;
}


const getTotalAttributes = (tokens, tyres) => {
    const {convertedTokens} = getConvertedTokens(tokens,tyres);
    return calculateTotalAttributes(convertedTokens);
}

const runLapForUser = async (seasonId, user, tokens, tyres, seed) => {
    const state = await getState(seasonId)
    return simulate(tokens, tyres, state.track, state.weather, seed)
}

export {runLapForUser,getTotalAttributes}