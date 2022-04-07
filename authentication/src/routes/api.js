import Express from 'express';
import { validationResult, checkSchema } from 'express-validator/check';
import { ValidationError, RegistrationRequired, BadInputError } from '../lib/error';
import { extractSessionOrThrow } from "../middleware/extractSession"
import { instance as MongoUtil } from '../lib/mongoutil';

const apiRoute = Express.Router();

apiRoute.all("*", extractSessionOrThrow);

const getUserBySession = async (req, res, next) => {
  try {
    const col = await MongoUtil.getCollection("users");
    const walletAddress = req.session.walletAddress;
    const result  = await col.findOne({walletAddress});
    const { lastModifiedTs, lastModified = (lastModifiedTs) ? lastModifiedTs.getHighBits() * 1000 : 0, _id, token, ...doc } = result;
    req.user = {...doc, lastModified};
    if(!req.user.email) {
      throw new RegistrationRequired(walletAddress);
    }
    next();
  } catch (e) {
    next(e)
  }
};

apiRoute.get("/", getUserBySession,  async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (e) {
    next(e)
  }
});

// check if the user has valid sessionId
apiRoute.post("/", getUserBySession,  async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (e) {
    next(e)
  }
});


const updateUserSchema = {
  nickname: { 
    optional: { options: { nullable: true } },
    isString: true 
  },
  harmonyWalletAddress : {
    optional: { options: { nullable: true } },
    isString: true 
  }

}
apiRoute.put("/user", checkSchema(updateUserSchema), async (req, res, next) => {
  try {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      throw new ValidationError(validationErrors.array())
    }
    const col = await MongoUtil.getCollection("users");
    const walletAddress = req.session.walletAddress;
    const body = req.body;
    if(Object.entries(body).length == 0) {
      throw new BadInputError("Empty body");
    }
    const findAndModifiedRes = await col.findOneAndUpdate({ walletAddress },
      {
        $set: { ...body },
        $currentDate: { lastModifiedTs: { $type: "timestamp" } }
      }, { upsert: false, returnOriginal: false });
    if (findAndModifiedRes.value) {
      const { lastModifiedTs, lastModified = (lastModifiedTs) ? lastModifiedTs.getHighBits() * 1000 : 0, _id, token, ...doc } = findAndModifiedRes.value;
      req.user = {...doc, lastModified};
    } else {
      throw new Error("Cannnot update user");
    }
    res.json(req.user);
  } catch (e) {
    next(e)
  }
})


apiRoute.post("/logout", async (req, res, next) => {
  try {
    const cookieDomain = req.hostname.replace(req.subdomains.join("."), "");
    res.cookie("sessionId", null, { maxAge: -1, domain: cookieDomain });
    res.json();
  } catch (e) {
    next(e)
  }
})



export { apiRoute };