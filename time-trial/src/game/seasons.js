import { mappings } from "@animoca/f1dt-core_metadata";

const seasonMiddleware = async (req, res, next) => {
    try {
        const { season } = req.params;
        const seasonName = season || '2019';
        const seasonMapping = mappings.Common.Attributes.Season.ByName[seasonName];
        if (!seasonMapping)
            throw new InvalidSeasonError();
        req.season = seasonName;
        req.seasonId = Number(seasonMapping.seasonId);
        next();
    } catch (e) {
        next(e);
    }
}
const getSeasonCollectionName = (seasonId, collectionName) => {
    return (`${seasonId}` === '2') ? collectionName : `${collectionName}_${seasonId}`;
}

module.exports = { getSeasonCollectionName, seasonMiddleware }