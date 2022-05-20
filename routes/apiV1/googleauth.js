'use strict';

const express = require('express');
const router = express.Router();

const authHandler = require('../../controllers/userController');

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

var passport = require('passport');
var userProfile;
 

router.use(passport.initialize());

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK
  },
  function(accessToken, refreshToken, profile, done) {
      return done(null, profile);
  }
));

passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});

router.get('/', passport.authenticate('google', { scope : ['profile', 'email'] }));

router.get('/error', authHandler.googleFailed);
 
router.get('/callback', 
    passport.authenticate('google', { failureRedirect: '/api/v1/auth/google/error' }),
    authHandler.google
);

module.exports = router;