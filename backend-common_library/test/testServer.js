import { polyfillConsole, expressServerBootstrap, UnknownApiError} from "../dist"
import express from 'express';
import logger from "winston";

polyfillConsole();
const app = express();
const router = express.Router();
router.get("/", (req, res) => {
  res.json({"a" : "b"});
});

router.post("/error", async (req, res, next) => {
  try {
    throw new Error("BB");
    res.json(req.body);
  } catch(e) {
    next(e);
  }
});

expressServerBootstrap(app, [router]);


export default app;



