'use strict';

const express = require('express');
const router = express.Router();


const authHandler = require('../../controllers/userController');

router.post('/login', authHandler.login);

router.post('/register', authHandler.register);

router.get('/google', (req, res) => {
    // handle google login
});


module.exports = router;