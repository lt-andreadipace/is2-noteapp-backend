'use strict';

var mongoose = require('mongoose');
require('dotenv').config();

module.exports.initDB = (dbname="noteapp") => {

    const DB_CONNECTION_STRING = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.5lue6.mongodb.net/${dbname}?retryWrites=true&w=majority`;
    return new Promise((resolve, reject) => {
        mongoose.connect(DB_CONNECTION_STRING, {
            useNewUrlParser: true
        }, (err) => {
            if (err) reject("DB can't connect");
            resolve("DB connected");
        });
    }) 
} 