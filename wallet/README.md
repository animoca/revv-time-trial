# NFT Wallet API

Express js service for handling NFT Wallet

## Usage:


#### Install dependencies

```bash
npm install
```

#### Running the service 

```bash
npm start
```

#### Creating and pushing a docker build

```bash
docker build -t asia.gcr.io/ab1-devops/$(node -p -e "require('./package.json').name"):$(node -p -e "require('./package.json').version") .
docker push asia.gcr.io/ab1-devops/$(node -p -e "require('./package.json').name")
```

#### Environment variables to declare:

```bash
CONTRACT_NAME
MONGO_URI
CORS_ALLOWED_ORIGINS
WEB3_CONFIG_URLS
CHAIN_ID
```
