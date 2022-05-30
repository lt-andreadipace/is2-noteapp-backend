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
        default: false
    },
    rootFolder: {
        type: folderSchema
    },
    documents: {
        type: [documentSchema],
        default: []
    },
    folders: {
        type: [folderSchema],
        default: []
    },
    sharedWithMe: {
        type: [String],
        default: []
    }
    //sharedPrefs: { preferences for all devices }
});

userSchema.pre('save', function () {
    this.rootFolder = { name: 'root' };
});


const userModel = mongoose.model('User', userSchema);

module.exports = userSchema;