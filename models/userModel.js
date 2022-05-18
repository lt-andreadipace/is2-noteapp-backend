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
        default: [] // add root folder
    }
    //sharedPrefs: { preferences for all devices }
});

userSchema.pre('validate', function () {
    // TODO: se non è con google, deve avere la password
});


const userModel = mongoose.model('User', userSchema);

module.exports = userSchema;