'use strict';

const express = require('express');
const router = express.Router();


const authHandler = require('../../controllers/userController');
const googleHandler = require('./googleauth');

router.post('/login', authHandler.login);

router.post('/register', authHandler.register);

router.use('/google', googleHandler);

module.exports = router;