
## Notes
- Starting from **31 Dec 2021** (Year/Week/Day format: 2021/52/4), Monaco and Belgium are removed from the pool of possible Track Ids. As a result, there will no longer be Time Trial events generated on these tracks.

#### Environment variables to declare:
| VARIABLE | EXAMPLE |
| :--- | :--- | 
| MONGODB_URL | mongodb://user:password@localhost:27017/dt?authSource=admin |
| MONGO_URL | mongodb://user:password@localhost:27017/dt?authSource=admin | 
| REDIS_URL | redis://localhost |
| COMPOSITION_ENDPOINT | http://localhost:8081 |
| USERS_ENDPOINT | http://localhost:8082 |
| WALLET_API_ENDPOINT | http://localhost:8083 |

## Simulate race

### Request
```http
POST /race/:compositionId/
```
Body
```json
{
  "finalLapTime": 127782,
  "score": 5.00333333333333,
  "tier": "D"
}
```
## Get current timetrial status
```http
GET /status
```

### Response
Returns the current state along with the state tomorrow and a list of states for the week leading up to today.
```json
{
  "track": "China",
  "weather": "HeavyRain",
  "next": {
    "track": "Brazil",
    "weather": "Hot"
  },
  "week": {
    "/2020/15/0": {
      "track": "Monaco",
      "weather": "LightRain"
    },
    "/2020/15/1": {
      "track": "Singapore",
      "weather": "Dry"
    },
    "/2020/15/2": {
      "track": "China",
      "weather": "HeavyRain"
    }
  }
}
```

## Get current leaderboard urls
```http
GET /leaderboard/
```

### Response

Will return urls of leaderboards available

```json
{
  "daily": [
    "/2020/13/0",
    "/2020/13/1"
  ],
  "weekly": [
    "/2020/12",
    "/2020/13"
    ]
}
```

## Get leaderboard for specified week with tier
```http
GET /leaderboard/weekly/:tier/:year/:week?limit=10$walletAddress=0x8c52075c94C1DC64a96dBa9A7aD0c45cc63e71e15
```

### Response
Returns array of entries truncated by limit including the one for walletAddress if provided

```json
[
  {
    "walletAddress": "0x8c52075c94C1DC64a96dBa9A7aD0c45cc63e71e15",
    "score": "5.00",
    "nickname": "Victor",
    "rank": 1
  },
```


## Get leaderboard for specified day with tier
```http
GET /leaderboard/daily/:tier/:year/:week/:day?limit=10$walletAddress=0x8c52075c94C1DC64a96dBa9A7aD0c45cc63e71e15
```
### Response
Returns array of entries truncated by limit including the one for walletAddress if provided
```json
[
  {
    "walletAddress": "0x8c52075c94C1DC64a96dBa9A7aD0c45cc63e71e15",
    "time": 127782,
    "score": 5.00333333333333,
    "nickname": "Victor",
    "rank": 1
  },...
]
```

## Get personal best, requires session
```http
GET /leaderboard/pb
```
### Response
Returns single object with time field set
```json
{
  "time": 127782
}
```

## Get track best
```http
GET /leaderboard/best
```
### Response
```json
{
  "time": 127782,
  "walletAddress": "0x8c52075c94C1DC64a96dBa9A7aD0c45cc63e71e1",
  "nickname": "victor"
}
```

## Get user profile, requires session
```http
GET /profile
```

### Response
```json
{
    "freeAttempts": 1,
    "attempts": 15
}
```
