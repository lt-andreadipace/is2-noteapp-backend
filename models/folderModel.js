'use strict';

const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    parent: {
        type: mongoose.ObjectId
    },
    created: {
        type: Date,
        default: Date.now
    }
});

module.exports = folderSchema;