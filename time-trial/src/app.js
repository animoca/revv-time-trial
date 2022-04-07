/*jshint esversion: 9 */

import express from "express";

// Middleware
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

import { DefaultCorsOption } from "@animocabrands/backend-common_library";
const cors = require("cors");

app.use(cors(DefaultCorsOption));

app.use("/", require("./routes/race"));
app.use("/", require("./routes/index"));
app.use("/", require("./routes/pool"));
app.use("/", require("./routes/report"));
app.use("/", require("./routes/leaderboard"));

module.exports = app;
