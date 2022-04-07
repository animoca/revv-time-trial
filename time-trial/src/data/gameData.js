/*jshint esversion: 9 */

import csv from "csvtojson";
import constants from "./constants";


class GameData {
    constructor() { }

    async init() {
        this.freeAttemptsPerDay = 1;
        await this._loadTracksIds();
        await this._loadTracks();
        await this._loadWeatherIds();
        await this._loadTyresDurability();
        await this._loadTyresWeatherModifiers();
        await this._loadTyresWeatherCaps();
        await this._loadTyresCircuitModifiers();
        await this._loadTrackAttributes();
        await this._loadLeaderboardTiers();
    }

    async _loadTracksIds() {
        const data = await csv().fromFile("./gameData/Game Data - Track IDs.csv");
        const trackIds = [];

        for (const track of data) {
            trackIds.push(track.Track)
        }
        
        this.trackIds = trackIds;
    }

    async _loadTracks() {
        const data = await csv().fromFile("./gameData/Game Data - Tracks.csv");

        const tracks = {};

        for (const track of data) {
            tracks[track.Track] = {
                time: { min: Number(track.MinimumTime), max: Number(track.MaximumTime )},
                attributes: { min: Number(track.AttributeMin), max: Number(track.AttributeMax) },
                power: Number(track.Power),
                randomness: Number(track.Randomness),
                scoreCoefficient: Number(track.ScoreCoefficient),
                record: Number(track.Record),
                primaryAttribute: track.PrimaryAttribute
            };
        }

        this.tracks = tracks;
    }

    async _loadWeatherIds() {
        const data = await csv().fromFile("./gameData/Game Data - Weather IDs.csv");

        const weatherIds = [];

        for (const weather of data) {
            weatherIds.push(weather.Weather);
        }

        this.weatherIds = weatherIds;
    }

    async _loadTyresCircuitModifiers() {
        const data = await csv().fromFile("./gameData/Game Data - Tyres Circuit Modifiers.csv");

        const mods = {};

        for (const record of data) {
            const tyreType = constants.TokenSubTypes.Tyres[record.Tyre];
            mods[tyreType] = {
                TopSpeed: record.TopSpeed,
                Grip: record.Grip
            };
        }

        this.tyresCircuitModifiers = mods;
    }

    async _loadTyresWeatherModifiers() {
        const data = await csv().fromFile("./gameData/Game Data - Tyres Modifiers.csv");

        const tyres = {};

        for (const record of data) {
            const tyreType = constants.TokenSubTypes.Tyres[record.Tyres];
            tyres[tyreType] = tyres[tyreType] || {};
            tyres[tyreType][record.Weather] = {
                topSpeed: Number(record.TopSpeed),
                acceleration: Number(record.Acceleration),
                grip: Number(record.Grip)
            };
        }

        this.tyresWeatherModifiers = tyres;
    }

    async _loadTyresWeatherCaps() {
        const data = await csv().fromFile("./gameData/Game Data - Tyre Type Modifier.csv");

        const tyres = {};

        for (const record of data) {
            const tyreType = constants.TokenSubTypes.Tyres[record.Tyres];
            tyres[tyreType] = tyres[tyreType] || {};
            tyres[tyreType][record.Weather] = record.Modifier;
        }
        this.tyresWeatherCaps = tyres;
    }

    async _loadTyresDurability() {
        const data = await csv().fromFile("./gameData/Game Data - Tyres Durability.csv");

        const tyres = {};

        for (const tyre of data) {
            const tyreType = constants.TokenSubTypes.Tyres[tyre.Tyres];
            tyres[tyreType] = tyres[tyreType] || {};
            tyres[tyreType][tyre.Weather] = Number(tyre.Coefficient);
        }

        this.tyresDurability = tyres;
    }

    async _loadTrackAttributes() {
        const data = await csv().fromFile("./gameData/Game Data - Track Attributes.csv");

        const attributes = {};

        for (const attr of data) {
            attributes[attr.Track] = {
                topSpeed: Number(attr.TopSpeed),
                acceleration: Number(attr.Acceleration),
                grip: Number(attr.Grip),
                stamina: Number(attr.Stamina),
                concentration: Number(attr.Concentration),
                aggression: Number(attr.Aggression),
                luck: Number(attr.Luck)
            };
        }

        this.trackAttributes = attributes;
    }

    async _loadLeaderboardTiers() {
        const data = await csv().fromFile("./gameData/Game Data - Leaderboard Tiers.csv");

        const tiers = [];

        for (const record of data) {
            tiers.push({
                tier: record.Tier,
                max: record.Max
            });
        }
        
        tiers.sort((x,y)=>{
            return x.max - y.max;
        });

        this.leaderboardTiers = tiers;
    }

    getTierForAttributes(attrs){
        for (var i = 0; i < this.leaderboardTiers.length; i++)
            if(attrs <= this.leaderboardTiers[i].max)
                return this.leaderboardTiers[i].tier;
        return this.leaderboardTiers[this.leaderboardTiers.length-1].tier;
    }
}

export default new GameData();