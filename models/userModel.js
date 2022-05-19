'use strict';

const mongoose = require('mongoose');
const documentSchema = require('./documentModel');
const folderSchema = require('./folderModel');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    since: {
        type: Date,
        default: Date.now
    },
    googleaccount: {
        type: Boolean,
        required: true
    },
    documents: {
        type: [documentSchema],
        default: []
    },
    folders: {
        type: [folderSchema],
        default: [] // TOOD: add root folder
    }
    //sharedPrefs: { preferences for all devices }
});


const userModel = mongoose.model('User', userSchema);

module.exports = userSchema;