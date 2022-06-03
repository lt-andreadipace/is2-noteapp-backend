'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = require('../models/userModel');  
const User = mongoose.model('User');

let MSG = {
    errorDuplicateEmail: "Email già esistente",
    errorUserNotFound: "Username o password sbagliate",
    errorGoogle: "Impossibile accedere con Google"
}

let generateToken = (user) => {
    return jwt.sign(
        {
            email: user.email,
            name: user.name,
            _id: user._id,
	        rootFolder: user.rootFolder._id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '1d'
        }
    );
}

module.exports.register = (req, res) => {
    var newUser = new User(req.body);
    let SALT_LENGTH = 10;
    newUser.password = bcrypt.hashSync(newUser.password, SALT_LENGTH);
    newUser.save(function(err, user) {
        if (err) {
            return res.status(400).send({
                error: MSG.errorDuplicateEmail
            });
        } else {
            return res.status(200).json({
                token: generateToken(user)
            });
        }
    });
}

module.exports.login = (req, res) => {
    User.findOne(
        {
            email: req.body.email
        },
        function(err, user) {
            if (err) throw err;
            if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
                return res.status(403).json({
                    error: MSG.errorUserNotFound
                });
            }
            return res.status(200).json({
                token: generateToken(user)
            });
        }
    );
}

module.exports.googleFailed = (req, res) => {
    res.status(400)
    .json({
        error: MSG.errorGoogle
    });
}

module.exports.google = (req, res) => {
    let userGoogle = req.user._json;
    req.logout(); // logout from google
    let filterEmail = {
        email: userGoogle.email
    };
    User.findOne(
        filterEmail,
        function(err, user) {
            if (err) throw err;
            if (!user) {
                userGoogle.googleaccount = true;
                var newUserGoogle = new User(userGoogle);
                newUserGoogle.save(function(err, user) {
                    if (err) {
                        return res.status(400).send({
                            error: MSG.errorDuplicateEmail
                        });
                    } else {
                        return res.status(200).json({
                            token: generateToken(user)
                        });
                    }
                });
            }
            else {
                const update = { googleaccount: true };
                let doc = User.findOneAndUpdate(filterEmail, update, (err, data) => {
                    let token = generateToken(user);
                    return res.redirect("https://www.noteapp-is2.tk/google-redirect?token=" + token);
                });
            }
        }
    );
}
