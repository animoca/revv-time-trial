import { DefaultMongoDBClient } from "@animocabrands/backend-common_library";
import {getSeasonCollectionName} from "./game/seasons"

const createIndexes = async (seasonId) => {
    try{
        const colName = getSeasonCollectionName(seasonId,"timetrial")
        const collection = await DefaultMongoDBClient().getCollection(colName);
        const timetrialIndexResult = await collection.createIndex({ walletAddress: 1, tier: 1 , day: 1 }, { unique: true });
        console.log(`Result of createIndex ${colName}`,timetrialIndexResult);
    }catch(e){
            console.error("Error in creating index ",e);
    }
    
    try{        
        const colName = getSeasonCollectionName(seasonId,"timetrial_loadouts")
        const loadoutsCollection = await DefaultMongoDBClient().getCollection(colName);
        const loadoutsIndexResult = await loadoutsCollection.createIndex({ loadout: 1 });
        console.log(`Result of createIndex ${colName}`,loadoutsIndexResult);
    }catch(e){
        console.error("Error in creating index ",e)
    }
    
    try{       
        const colName = getSeasonCollectionName(seasonId,"timetrial_state")
        const stateCollection = await DefaultMongoDBClient().getCollection(colName);
        const stateIndexResult = await stateCollection.createIndex({ dayTs: 1 }, { unique: true });
        console.log(`Result of createIndex ${colName}`,stateIndexResult);
    }catch(e){
        console.error("Error in creating index ",e)
    }
    
    try{      
        const colName = getSeasonCollectionName(seasonId,"timetrial_track_bests")
        const trackBestsCollection = await DefaultMongoDBClient().getCollection(colName);
        const trackBestsIndexResult = await trackBestsCollection.createIndex({ track : 1, weather : 1 }, { unique: true });
        console.log(`Result of createIndex ${colName}`,trackBestsIndexResult);
    }catch(e){
        console.error("Error in creating index ",e)
    }
    
    try{      
        const colName = getSeasonCollectionName(seasonId,"timetrial_track_personal_bests")
        const trackPersonalBestsCollection = await DefaultMongoDBClient().getCollection(colName);
        const trackPersonalBestsIndexResult = await trackPersonalBestsCollection.createIndex({ track : 1, weather : 1, walletAddress : 1 }, { unique: true });
        console.log(`Result of createIndex ${colName}`,trackPersonalBestsIndexResult);
    }catch(e){
        console.error("Error in creating index ",e)
    }
}

module.exports = {createIndexes}