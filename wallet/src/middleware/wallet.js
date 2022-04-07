import { DefaultMongoDBClient, MongoDBUtils } from '@animocabrands/backend-common_library';
import { contractAddress } from 'config';
import logger from 'winston';


const mongoClient = new DefaultMongoDBClient();
const middlewareFn = async (req, res, next) => {
  try {
    const collectionName = await MongoDBUtils.getCollectionNameByContractAddress(contractAddress, 'nftowner');
    const walletAddress = req.params.walletAddress || req.body.walletAddress || req.query.walletAddress;
    console.log(`getting tokens for ${walletAddress}`);
    let size = 0;
    const nfts = {};
    console.log(`Getting content for owner ${walletAddress} with collection ${collectionName}`);
    const col = await mongoClient.getCollection(collectionName);
    // todo add paging later.
    const cursor = await col.find({ owner: walletAddress }, { projection: { tokenId: 1, uri: 1, _id: 0 } });
    while (await cursor.hasNext()) {
      const { tokenId, uri } = await cursor.next();
      nfts[tokenId] = { uri };
      size++;
    }
    console.log(`queried ${size} tokens for ${walletAddress}`);
    req.walletNfts = nfts;
    next();
  } catch (e) {
    next(e);
  }
}

const walletMiddleware = middlewareFn;

export { walletMiddleware };