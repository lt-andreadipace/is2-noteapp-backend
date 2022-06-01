'use strict';

const express = require('express');
const cors = require('cors');

// require apiV1 routes
const apiV1 = require('./routes/api.v1');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/v1', apiV1);

module.exports = app;