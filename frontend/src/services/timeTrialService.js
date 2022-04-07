import queryString from 'query-string';

const workshopBaseURL = process.env.REACT_APP_WORKSHOP_API_BASE_URL
const timeTrialBaseURL = process.env.REACT_APP_TIMETRIAL_API_BASE_URL

export async function getComposition(id, season = '2019') {
  let url = workshopBaseURL;
  const options = {
      method: 'GET',
      credentials: 'include', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
      }
    };
    url+=`/${season}/${id}`;
    
  const response = await fetch(url, options)
  
  if(response.status != 200) {
      throw 'error';
  }
  const obj = await response.json();

  return obj
}

export async function getTriesLeft(season = '2019') {
  let url = timeTrialBaseURL;
  const options = {
      method: 'GET',
      credentials: 'include', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
      }
    };
    url+=`/${season}/profile`;
    
  const response = await fetch(url, options)
  
  if(response.status != 200) {
      throw 'error';
  }
  const obj = await response.json();
  return parseInt(obj.freeAttempts || 0) + parseInt(obj.attempts || 0);
}

export async function getTier(compId, tyreTokenId, season = '2019') {
  const options = {
    credentials: 'include', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if(!tyreTokenId) return false;

  let url =`${timeTrialBaseURL}/${season}/tier/${compId}?tyresToken=${tyreTokenId}`;
  const response = await fetch(url, options)
  
  if(response.status != 200) {
      console.error('error');
      return {tier: '-'}
  }
  const obj = await response.json();
  return obj
}

export async function race(options, season = '2019') {
  const {compId, tyresToken, tier} = options;
  let url = timeTrialBaseURL;
  let payload = {tyresToken}
  if(tier) payload.tier = tier;

  const request = {
      method: 'POST',
      credentials: 'include', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
      },body:JSON.stringify(payload)
    };
    url+=`/${season}/race/${compId}`;
    
  const response = await fetch(url, request)
  
  if(response.status != 200) {
      throw 'error';
  }
  const obj = await response.json();
  return obj
}

export async function getStatus(season = '2019') {
  let url = timeTrialBaseURL;
  const options = {
      method: 'GET',
      credentials: 'include', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
      }
    };
    url+=`/${season}/status`;
    
  const response = await fetch(url, options)
  
  if(response.status != 200) {
      throw 'error';
  }
  const obj = await response.json();
  return obj
}

export async function getTyres(season = '2019') {
  let url = workshopBaseURL;
  const options = {
      method: 'GET',
      credentials: 'include', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
      }
    };
    url+=`/${season}/tyres`;
    
  const response = await fetch(url, options)
  
  if(response.status != 200) {
      throw 'error';
  }
  const obj = await response.json();
  return obj
}

export async function getLeaderboards(season = '2019') {
  const options = {
    method: 'GET',
    credentials: 'include'
  }

  let url = timeTrialBaseURL + `/${season}/leaderboard`

  const res = await fetch(url, options)

  if(res.status != 200) {
    throw 'error';
  }
  return await res.json()
}

export async function getWeeklyLeaderboard(options, season = '2019') {
  let {
    tier,
    path,
    limit,
    walletAddress
  } = options;

  const QueryOptions = {
    method: 'GET'
  }

  let qs = queryString.stringify({walletAddress, limit})
  let url = `${timeTrialBaseURL}/${season}/leaderboard/weekly/${tier}${path}?${qs}`

  const res = await fetch(url, QueryOptions)

  if(res.status === 404) {
    console.log(`No entries for week ${path} yet`)
    return [];
  }

  if(res.status !== 200) {
    return [];
  }

  return await res.json()
}

export async function getDailyLeaderboard(options, season = '2019') {
  let {
    tier,
    path,
    walletAddress,
    limit
  } = options;

  if(!path || !path.length) {
    return []; // unknown path
  }

  const queryOptions = {
    method: 'GET'
  }

  let qs = queryString.stringify({walletAddress, limit})
  let url = `${timeTrialBaseURL}/${season}/leaderboard/daily/${tier}${path}?${qs}`


  return fetch(url, queryOptions)
    .then(response => {
      if(response.status === 200) {
        return response.json()
      } else {
        throw new Error(`Failed to get leaderboard for daily/${tier}/${path}`)
      }
    })
    .catch(e => {
      // console.log(e)
      return [];
    })
}

export async function getBestDailyUserResult(season = '2019') {
  const queryOptions = {
    method: 'GET',
    credentials: 'include'
  }

  let url = `${timeTrialBaseURL}/${season}/leaderboard/pb`

  const res = await fetch(url, queryOptions);

  if(res.status !== 200) {
    console.error('Failed to get daily personal best.');
    return 0;
  }
  return await res.json();
}

export async function getBestOverall(season = '2019') {
  const queryOptions = {
    method: 'GET',
    credentials: 'include'
  }

  let url = `${timeTrialBaseURL}/${season}/leaderboard/best`

  const res = await fetch(url, queryOptions)

  if(res.status != 200) {
    console.error('Failed to get daily leaderboards.')
    return 0;
  }

  let result = await res.json()
  return result;
}

export async function getBestDailyResult(tier, season = '2019') {
  const dailies = await getLeaderboards(season);
  const path = dailies.daily[dailies.daily.length-1];

  tier = tier || 'A'

  const queryOptions = {
    method: 'GET',
    credentials: 'include'
  }

  let url = `${timeTrialBaseURL}/${season}/leaderboard/daily/${tier}${path}`

  const res = await fetch(url, queryOptions)

  if(res.status != 200) {
    console.error('Failed to get daily leaderboards.')
    return 0;
  }

  let rows = await res.json()
  return rows;
}

export async function getWeeklyRewards(season = '2019') {
  const queryOptions = {
    method: 'GET'
  }

  let url = `${timeTrialBaseURL}/${season}/pool`

  const res = await fetch(url, queryOptions)

  if(res.status != 200) {
    return {eth: 0, revv: 0};
  }

  let data = await res.json()
  return data;
}