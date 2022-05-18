'use strict';

const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    parent: {
        type: mongoose.ObjectId,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    shared: {
        type: Boolean,
        default: false
    }
});

// TODO: aggiorna il campo 'updated' ad ogni modifica

module.exports = documentSchema;