'use strict';

const mongoose = require('mongoose');

const userSchema = require('../models/userModel');  
const User = mongoose.model('User');

let MSG = {
    noteNotFound: "Nota non trovata",
    updateFailed: "Salvataggio nota fallito"
}

module.exports.make_public = (req, res) => {
    User.findOneAndUpdate({
        "_id": req.user._id,
        "documents._id": req.noteid
    },
    {
        $set: {
            "documents.$.shared": true
        }
    },
    {
        returnOriginal: false
    },
    (err, doc) => {
        if (err) {
            res.status(400).json({
                error: MSG.updateFailed
            })
        }
        else {
            res.status(200).json(doc.documents[0]);
        }
    });
}

module.exports.make_private = (req, res) => {
    User.findOneAndUpdate({
        "_id": req.user._id,
        "documents._id": req.noteid
    },
    {
        $set: {
            "documents.$.shared": false
        }
    },
    {
        returnOriginal: false
    },
    (err, doc) => {
        if (err) {
            res.status(400).json({
                error: MSG.updateFailed
            })
        }
        else {
            res.status(200).json(doc.documents[0]);
        }
    });
}

module.exports.share = (req, res) => {
    User.findOne({
        "_id": req.userid,
        "documents._id": req.noteid,
        "documents.shared": true
    },
    "documents.$",
    (err, doc) => {
        if (err || doc == undefined) {
            res.status(400).json({
                error: MSG.noteNotFound
            })
        }
        else {
            res.status(200).json(doc.documents[0]);   
        }
    });
}