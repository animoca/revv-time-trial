const stateTableMigration = () => {  
    (() => {
        const docs = db.timetrial_state.find();
        const newDocs = docs.map(entry => {
            var date = new Date("March 30, 2020 00:00:00");
            const weekDelta = entry.week - 14;
            date.setDate(date.getDate() + entry.day + (weekDelta * 7));
            return {
                day: entry.day,
                week: entry.week,
                track: entry.track,
                weather: entry.weather,
                dayTs: date.getTime()
            };
        });
        
        db.timetrial_state.drop();
        db.timetrial_state.insertMany(newDocs);
    })()
}

const populateTrackPersonalBests = async () => {
    const timeTrialCollection = await DefaultMongoDBClient().getCollection("timetrial");
    
    await timeTrialCollection.aggregate(
        [
            { $lookup:{from:"timetrial_state",localField:"day",foreignField:"dayTs",as:"state"}},
            { $unwind: "$state"},
            { $unwind: "$entries"},
            {
                $group:{
                    _id:{walletAddress:"$walletAddress",track:"$state.track",weather:"$state.weather"},
                    time:{$min:"$entries.time"}
                }
            },
            { $project:{_id:0,track:"$_id.track",weather:"$_id.weather",walletAddress:"$_id.walletAddress",time:1} },
            { $out : "timetrial_track_personal_bests" }
        ])
}

const populateTrackBests = async () => {
    const timeTrialCollection = await DefaultMongoDBClient().getCollection("timetrial");

    await timeTrialCollection.aggregate(
        [
            { $lookup:{from:"timetrial_state",localField:"day",foreignField:"dayTs",as:"state"}},
            { $unwind: "$state"},
            { $unwind: "$entries"},
            {
                $group:{
                    _id:{walletAddress:"$walletAddress",track:"$state.track",weather:"$state.weather"},
                    time:{$min:"$entries.time"}
                }
            },
            {$sort:{time:1}},
            {
                $group:{
                    _id:{track:"$_id.track",weather:"$_id.weather"},
                    entries: { $first: {walletAddress:"$$ROOT._id.walletAddress",time:"$$ROOT.time"} }
                }
            },
            {$unwind: "$entries"},
            { $project:{_id:0,track:"$_id.track",weather:"$_id.weather",walletAddress:"$entries.walletAddress",time:"$entries.time"} },
            { $out : "timetrial_track_bests" }
            
        ])
}
