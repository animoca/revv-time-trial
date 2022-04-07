const express = require('express');
const cookieParser = require('cookie-parser');
const indexRouter = require('./routes/index');
const app = express();
const cors = require('cors');
import {DefaultCorsOption} from "@animocabrands/backend-common_library";
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors(DefaultCorsOption));

app.use('/', indexRouter);

module.exports = app;
