import { getImageUrlForItem, getFullMetaDataFromTokenId } from '../services/nftData'

const baseURL = process.env.REACT_APP_WORKSHOP_API_BASE_URL

export async function getItemsAndComposition(options) {
  options = options || {};
  const {season, excludeItems} = options;
  let url = `${baseURL}/${season ? season : "2019"}${excludeItems ? "?excludeItems=true": ""}`;
  const request = {
    method: 'GET',
    credentials: 'include', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const response = await fetch(url, request)

  if (response.status != 200) {
    throw 'error';
  }
  const obj = await response.json();

  let items;
  if(!excludeItems) {
    items = obj.items
      .reduce((map,tokenId)=>{
        const nft = getFullMetaDataFromTokenId(tokenId)
        if(nft.teamId == 111) nft.teamId = null;
        nft.images = getImageUrlForItem(nft)
        map[tokenId] = nft;
        if(nft.typeId === 6) delete map[tokenId];      // remove tracks
        return map;
      }, {})
  }

  return { items, composition: obj.composition, names: obj.names }
}

export async function equipItem(season = 2019, team, tokenId) {
  const options = {
    method: 'PUT',
    credentials: 'include', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ tokenId })
  };
  const url = `${baseURL}/${season}/equip/${team}`;

  const response = await fetch(url, options)

  if (response.status != 200) {
    throw 'error';
  }
  return (await response.json())
}

export async function getCompositionNames(season = 2019) {
  const options = {
    method: 'GET',
    credentials: 'include', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
    }
  };
  let url = `${baseURL}/${season}/team_names`

  const response = await fetch(url, options)

  if (response.status != 200) {
    throw 'error';
  }
  return (await response.json())
}

export async function getCompositionById(season = 2019, compId) {
  const options = {
    method: 'GET',
    credentials: 'include', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const url = `${baseURL}/${season}/${compId}`;

  const response = await fetch(url, options)

  if (response.status !== 200) {
    throw 'error';
  }

  return response.json();
}

export async function renameComposition(season = 2019, compId, name) {
  const options = {
    method: 'PUT',
    credentials: 'include', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name })
  };
  let url = `${baseURL}/${season}/rename/${compId}`

  const response = await fetch(url, options)

  if (response.status != 200) {
    throw 'error';
  }
  return response.json();
}

export async function unequipItem(season = 2019, tokenId) {
  const options = {
    method: 'PUT',
    credentials: 'include', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ tokenId })
  };
  const url = `${baseURL}/${season}/unequip/`;

  const response = await fetch(url, options)

  if (response.status != 200) {
    throw 'error';
  }
  return (await response.json())
}

// NOT USED
export async function resetTeam(season = 2019, team) {
  let url = baseURL;
  const options = {
    method: 'PUT',
    credentials: 'include', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
    }
  };
  url += season + "/reset/" + team;

  const response = await fetch(url, options)

  if (response.status != 200) {
    throw 'error';
  }
  return (await response.json())
}

export async function markRead(tokenId) {
  let url = baseURL;
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ tokenId })
  };
  url += "viewed";

  const response = await fetch(url, options)

  if (response.status != 200) {
    throw 'error';
  }

  return await response.json()
}
