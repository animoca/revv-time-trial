import express  from 'express';
import {checkSchema, validationResult} from 'express-validator/check';
import {Validators, InternalError, ValidationError} from "@animocabrands/backend-common_library";
import {walletMiddleware} from "../middleware/wallet";
const {WalletAddressValidator} = Validators;
const router = express.Router();


router.get('/ping', function(req, res, next) {
  res.json({response: process.env.CHAIN_ID});
});

const walletApiSchema = {
  walletAddress : WalletAddressValidator
}
const walletValidation = checkSchema(walletApiSchema);
router.all('/wallet/:walletAddress', [walletValidation, walletMiddleware] );
router.all('/wallet/*', async (req, res, next) => {
  try {
    console.log("CHAINID", req.chainId);
    const validationErrors = validationResult(req);
    if(!validationErrors.isEmpty()) {
      throw new ValidationError(validationErrors.array())
    }
    if(req.walletNfts) {
      res.json(req.walletNfts);
    }else {
      throw new InternalError("Middleware walletMiddleware had not executed");
    }
  } catch (e) {
    next(e);
  }
});


export default router;