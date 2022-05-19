'use strict';

const config = require('./config');
const express = require('express');

// require apiV1 routes
const apiV1 = require('./routes/api.v1');

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());

app.use('/v1', apiV1);

app.listen(PORT, () => {
    console.log("Server started");
});