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
    }
});

// TODO: aggiorna il campo 'updated' ad ogni modifica
documentSchema.pre('update', function() {
    console.log('ciao');
})

module.exports = documentSchema;