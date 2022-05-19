'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userSchema = require('../models/userModel');  
const User = mongoose.model('User');

let MSG = {
    errorDuplicateEmail: "Email già esistente",
    errorUserNotFound: "Username o password sbagliate"
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
            return res.status(200).json(
                {
                    token: jwt.sign(
                        {
                            email: user.email,
                            name: user.name,
                            _id: user._id
                        },
                        process.env.JWT_SECRET
                    )
                }
            );
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
            return res.status(200).json(
                {
                    token: jwt.sign(
                        {
                            email: user.email,
                            name: user.name,
                            _id: user._id
                        },
                        process.env.JWT_SECRET
                    )
                }
            );
        }
    );
}