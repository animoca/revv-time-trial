const express = require('express');
const router = express.Router();
import {compositionGame} from './compositionGame';

/* GET home page. */
router.get('/ping', function(req, res, next) {
  res.json({response: "pong"});
});
router.use("/", compositionGame);
module.exports = router;
