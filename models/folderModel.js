'use strict';

const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    parent: {
        type: mongoose.ObjectId,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

// TODO: aggiorna il campo 'updated' ad ogni modifica

module.exports = folderSchema;