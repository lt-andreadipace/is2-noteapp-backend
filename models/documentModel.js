'use strict';

const mongoose = require('mongoose');
const Delta = require('quill-delta');

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
        default: JSON.stringify(new Delta())
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
    },
    starred: {
        type: Boolean,
        default: false
    }
});

module.exports = documentSchema;