import bits from 'bits.js';
import BigInteger from 'big-integer';
import { getFullMetadata } from '@animoca/f1dt-core_metadata/src/utils';

const constants = require('./nftConstants.json')

export function getRacingAttributes(coreMeta) {
  let race = coreMeta.racing
  if(!race) return {};
  const attributeValues = [race.stat1, race.stat2, race.stat3, race.luck]
  const racingAttributeFields = constants.RacingAttributeFields[coreMeta.type.toLowerCase()]
  return racingAttributeFields.reduce((map, field, index) => {
    map[field] = attributeValues[index]
    return map
  }, {})
}

export function getFullMetaDataFromTokenId(tokenId) {
  try {
    let meta = getFullMetadata(tokenId);
    
    let {
      rarityTier,
      subType,
      type,
      typeId
    } = meta.core_attributes

    let attributes = typeId !== 6 
      ? getRacingAttributes(meta.core_attributes)
      : {};

    let result = {
      ...meta,
      ...meta.core_attributes,
      attributes,
      tier: rarityTier.toLowerCase(),
      tokenId,
      // tokenSubType: subType.toLowerCase().replace(/[\s]+/g, ''),
      tokenType: type.toLowerCase(),
      type: type == "Car" || type == "Driver" || type == "Tyres"
        ? type.toLowerCase()
        : subType.toLowerCase().replace(/[\s]+/g, '')
    }
    //#region NFT_IMAGES
    delete result.image;
    //#endregion NFT_IMAGES

    return result;
  } catch (e) {
    console.error("Failed to decode tokenId ", tokenId, " ", e)
    return {
      tokenId,
      attributes: { 'topSpeed': 0, 'acceleration': 0, "grip": 0 },
      images: {
        icon: "",
        preview: "",
        driverPreview: null
      }
    }
  }
}

export function getNFTDataFromTokenId(tokenId) {
  try {
    const unpacked = bits.decode(constants.MMTPropertiesLayout, BigInteger(tokenId))
    const tokenType = constants.TokenTypeIds[Number(unpacked.type)]
    const tokenSubType = constants.TokenSubTypeIds[constants.TokenTypeIds[Number(unpacked.type)]][Number(unpacked.subType)]
    const type = tokenType == "car" || tokenType == "driver" || tokenType == "tyres" ? tokenType : tokenSubType
    const revvTeam = (tokenType == "car" || tokenType == "driver") ? Number(unpacked.team) : null;
    const model = Number(unpacked.model);
    const driverNumber = Number(unpacked.driverNumber)
    const racingAttributeFields = constants.RacingAttributeFields[tokenType]
    const attributeValues = [Number(unpacked.stat1), Number(unpacked.stat2), Number(unpacked.stat3), Number(unpacked.luck)]
    const attributes = racingAttributeFields.reduce((map, field, index) => {
      map[field] = attributeValues[index]
      return map
    }, {})

    const obj = {
      tokenId,
      type,
      tokenType,
      tokenSubType,
      revvTeam,
      model,
      driverNumber,
      rarity: Number(unpacked.rarity),
      tier: constants.Rarities[Number(unpacked.rarity)],
      season: constants.Seasons[Number(unpacked.season)],
      collectionId: Number(unpacked.collection),
      collection: constants.Collections[Number(unpacked.collection)],
      attributes
    }
    // console.log("old obj", obj)

    return obj
  } catch (e) {
    console.error("Failed to decode tokenId ", tokenId, " ", e)
    return {
      tokenId,
      attributes: { 'topSpeed': 0, 'acceleration': 0, "grip": 0 },
      images: {
        icon: "",
        preview: "",
        driverPreview: null
      }
    }
  }
}

export const getImageUrlForItem = (item) => {
  if (!item.image) {
    return "";
  }
  const tokenType = item.tokenType;
  const compositionBaseUrl = process.env.REACT_APP_NFT_IMAGES_BASE_URL;

  let icon = "";
  let preview = "";
  let driverPreview = null;

  const nftImageUrl = item.image;
  const nftImageFilename = nftImageUrl.split('/').pop();

  // Remove file extension
  const nftImageFilenameWithoutExtension = nftImageFilename.replace(/\.png+$/, "");

  // Remove season prefix
  const compositionImageName = nftImageFilenameWithoutExtension.substring(nftImageFilenameWithoutExtension.indexOf("_")).substring(1);

  const removeRarityTextFromImageName = (imageName) => {
    return imageName.substring(0, imageName.indexOf("_"));
  }

  switch (tokenType) {
    case "car":
      const carImageName = item.rarity == 0
        ? nftImageFilenameWithoutExtension
        : removeRarityTextFromImageName(compositionImageName);
      preview = `${compositionBaseUrl}${item.season}/${carImageName}`;
      break;
    case "driver":
      const driverImageName = item.tier == "epic" || item.tier == "legendary"
        ? compositionImageName
        : removeRarityTextFromImageName(compositionImageName);
      preview = `${compositionBaseUrl}${item.season}/${driverImageName}`;
      driverPreview = `${compositionBaseUrl}${item.season}/${driverImageName}_full`;
      break;
    case "part":
      switch (item.season) {
        case '2019':
          preview = `${compositionBaseUrl}${item.season}/${removeRarityTextFromImageName(compositionImageName)}`;
          break;
        case '2020':
          preview = `${compositionBaseUrl}${item.season}/${compositionImageName}`;
          break;
      }

      break;
    case "tyres":
      preview = `${compositionBaseUrl}${item.season}/${removeRarityTextFromImageName(compositionImageName)}`;
      break;
    case "gear":
      preview = `${compositionBaseUrl}${item.season}/${compositionImageName}`;
      break;
    default:
      break;
  }

  preview = `${preview}.png`;
  if (driverPreview) {
    driverPreview = `${driverPreview}.png`;
  }
  icon = preview;

  return {
    icon,
    preview,
    driverPreview
  }
}

export function getNFTData(tokenIds) {
  return tokenIds.map(tokenId => getNFTDataFromTokenId(tokenId))
}