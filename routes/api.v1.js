'use strict';

const express = require('express');
const apiV1 = express.Router();

const authRouter = require('./apiV1/auth');
const notesCRUD = require('./apiV1/notesCRUD');
const foldersCRUD = require('./apiV1/foldersCRUD');
const shareRouter = require('./apiV1/share');

// middleware that tracks request
apiV1.use(function timeLog(req, res, next) {
  console.log(`Requested ${req.originalUrl} From ${req.headers['x-forwarded-for']} Time: ${Date.now()}`);
	next();
});

apiV1.use('/auth', authRouter);
apiV1.use('/notes', notesCRUD);
apiV1.use('/folders', foldersCRUD);
apiV1.use('/share', shareRouter);

module.exports = apiV1;