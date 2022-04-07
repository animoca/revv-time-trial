# REVV Time Trial
## Start up the project
1. Setup a `.env` for the frontend with all the necessary environment variables
2. Run the following script in your terminal:
```
./start.sh
```
3. Open the browser and navigate to http://localhost:3000
4. Try out the time trial simulation!
<br />

## How to set token ownership
You may update/add new entries in the seed data `/mongo-seed/nftowner_0x6CE16F115CE95FaB92c43CcE0D42dF54Ca08dB2B.json` to set token ownership.
```
{
    "_id": { "$oid": <mongodb object id> },
    "tokenId": <token id>,
    "lastModTs": <timestamp when update this token>,
    "owner": <your wallet address>,
    "uri": <token id uri>
}
```
<br />

## How to update number of attempts
You may update/add new entries in the seed data `/mongo-seed/timetrial_attempts.json` to update the number of attempts for your wallet address.
```
{
    "_id": {
        "$oid": <mongodb object id>
    },
    "walletAddress": <your wallet address>,
    "attempts": 10.0
}
```
<br />

## Remarks
This project includes the frontend and the backend services for running the Time Trial game:

- Time trial frontend
- Time trial backend
- Authentication backend
- Wallet backend
- Composition backend
<br />

### Frontend
In the UI, to enable the nft images, team logos, and track images, please search the following tags in the code and uncomment those lines.
- `NFT_IMAGES`
    - You can add url that hosts those images with `REACT_APP_NFT_IMAGES_BASE_URL` in environment variables for `website` service in docker compose file.
- `TEAM_LOGOS`
- `TRACK_IMAGES`
<br />

### Email Verification
This is for verifying email when users trying to create their account. It uses `AWS Simple Email Service`. To enable this feature, please setup the credentials for `AWS` and add the following flag in environment variables under `auth` section in docker compose file:
```
EMAIL_VERIFICATION_ENABLE: true
``` 
In the frontend code, please search the tag `EMAIL_VERIFICATION` in the code and uncomment those lines.

<br />

### News Letter Subscription
In the frontend code, please search the tag `NEWSLETTER_SUBSCRIPTION` in the code and uncomment those lines.

<br />

## Environment Variables
The environment variables can be edited in the `docker-compose.yml`
<br />

### Authentication api
|Required| Name | Example value | Remarks |
| :----: | ---- | ------------- | ----------- |
|&#10003;|REDIS_URL|redis://redis:6379|  |
|&#10003;|MONGODB_URL|mongodb://user:password@mongo:27017/revv?authSource=admin|  |
|&#10003;|WAIT_HOSTS|mongo:27017, redis:6379| Hosts that need to wait for before startup |
||CORS_ALLOWED_ORIGINS|[{"regex": "http[s]?:\/\/localhost:[0-9]{4}"}]|  |
||DEFAULT_ETHEREUM_NETWORK_ID|4||
||AUTHENTICATION_SESSION_SECRET|dev|  |
||DAPPER_HTTP_PROVIDER|http://localhost:8545|  |
||OPENSEA_ENABLE|false| Opensea account verification|
||OPENSEA_API_KEY|(your opensea api key)| Opensea api key|
||WEBPURIFY_ENABLE|true| Enable or disable checking nickname value with webpurify |
||WEBPURIFY_URL|https://api1-ap.webpurify.com/services/rest/||
||WEBPURIFY_API_KEY|(your webpurify api key)||
||EMAIL_VERIFICATION_ENABLE|false||
||EMAIL_VERIFICATION_SOURCE_EMAIL|\"REVV Time Trial\" <test@gmail.com>| Email address for sending verification email|
<br />

### Wallet api
|Required| Name | Example value | Remarks |
| :----: | ---- | ------------- | ----------- |
|&#10003;|CHAIN_ID| 4 |  |
|&#10003;|MONGO_URI| mongodb://user:password@mongo:27017/revv?authSource=admin |  |
|&#10003;|WAIT_HOSTS| mongo:27017 | Hosts that need to wait for before startup |
||CORS_ALLOWED_ORIGINS|[{"regex": "http[s]?:\/\/localhost:[0-9]{4}"}]|  |
||CONTRACT_ADDRESS|0x6ce16F115cE95FAB92c43CCE0d42dF54ca08dB2b| Contract address of the nft token contract |
<br />

### Composition api
|Required| Name | Example value | Remarks |
| :----: | ---- | ------------- | ----------- |
|&#10003;|CHAIN_ID| 4 |  |
|&#10003;|REDIS_URI| redis://redis:6379 ||
|&#10003;|MONGO_URI| mongodb://user:password@mongo:27017/revv?authSource=admin |  |
|&#10003;|WAIT_HOSTS| mongo:27017, redis:6379 | Hosts that need to wait for before startup |
||CORS_ALLOWED_ORIGINS|[{"regex": "http[s]?:\/\/localhost:[0-9]{4}"}]|  |
||AUTHENTICATION_SESSION_SECRET|dev||
||CONTRACT_ADDRESS|0x6ce16F115cE95FAB92c43CCE0d42dF54ca08dB2b| Contract address of the nft token contract |
<br />

### Time Trial api
|Required| Name | Example value | Remarks |
| :----: | ---- | ------------- | ----------- |
|&#10003;|REDIS_URI| redis://redis:6379 |  |
|&#10003;|MONGO_URI| mongodb://user:password@mongo:27017/revv?authSource=admin |  |
|&#10003;|COMPOSITION_ENDPOINT| http://composition:8083 |  |
|&#10003;|USERS_ENDPOINT| http://authentication:8081 |  |
|&#10003;|WALLET_API_ENDPOINT| http://wallet:8082|  |
|&#10003;|WAIT_HOSTS| mongo:27017, redis:6379 | Hosts that need to wait for before startup |
||CORS_ALLOWED_ORIGINS|[{"regex": "http[s]?:\/\/localhost:[0-9]{4}"}]|  |
||AUTHENTICATION_SESSION_SECRET|dev|  |
||STATE_OFFSET_IN_DAYS|0| Offset of days of tracks and weather start |
||REVV_POOL_DEFAULT_AMOUNT|5000| Base revv amount of the pool |
||SHARED_ATTEMPTS_BETWEEN_SEASONS|true||
||POOL_REWARD_RATIOS|{"current":0.7,"next":0.3}||
||ATTEMPT_PRICE|10||
||REVV_POOL_FIXED_AMOUNT|null||
<br />

### Website
|Required| Name | Example value | Remarks |
| :----: | ---- | ------------- | ----------- |
|&#10003;|REACT_APP_CHAIN_ID|4|  |
|&#10003;|REACT_APP_DEFAULT_WEB3_PROVIDER_ID|rinkeby|  |
|&#10003;|REACT_APP_USER_API_BASE_URL| http://localhost:8081 |  |
|&#10003;|REACT_APP_WALLET_API_URL| http://localhost:8082 |  |
|&#10003;|REACT_APP_WORKSHOP_API_BASE_URL| http://localhost:8083 |  |
|&#10003;|REACT_APP_TIMETRIAL_API_BASE_URL| http://localhost:8084 | |
|&#10003;|REACT_APP_PROVIDER_URL| /contractConfig/Provider.json | Path/URL for the provider json | 
|&#10003;|REACT_APP_DEPLOYMENT_CONTEXT_URL| /contractConfig/DeploymentContext.json | Path/URL for the DeploymentContext json|
|&#10003;|REACT_APP_VERSION|$npm_package_version||
||REACT_APP_NFT_IMAGES_BASE_URL|https://image.revvtimetrial.com/| Base url where the nft images hosted|