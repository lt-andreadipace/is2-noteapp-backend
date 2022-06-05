'use strict';

const mongoose = require('mongoose');

const userSchema = require('../models/userModel');  
const User = mongoose.model('User');

let MSG = {
    noteNotFound: "Nota non trovata",
    updateFailed: "Salvataggio nota fallito"
}

module.exports.get_shared = (req, res) => {
    User.findOne({
        "_id": req.user._id
    },
    "sharedWithMe",
    async (err, doc) => {
        let toReturn = [], toDelete = [];
        for (const id of doc.sharedWithMe) {
            let idinfo = id.split(":");
            let userid = idinfo[0];
            let noteid = idinfo[1];
            let response = await User.findOne({
                "_id": userid,
                "documents._id": noteid,
                "documents.shared": true
            });
            let shared = response.documents.id(noteid);
            if (shared && shared.shared) {
                toReturn.push({
                    name: shared.name,
                    userid: userid,
                    noteid: noteid
                });
            }
            else {
                toDelete.push(id);
            }
        };
        if (toDelete.length) {
            await User.findOneAndUpdate({
                    _id: req.user._id
                },
                {
                    $pull: {
                        "sharedWithMe": {
                            $in: toDelete
                        }
                    }
                }
            );
        }
        res.json(toReturn);
    });
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
        fields: {
            "documents.$": 1
        }
    },
    (err, doc) => {
        console.log(doc.documents);
        if (err) {
            res.status(400).json({
                error: MSG.updateFailed
            })
        }
        else {
            doc.documents[0].shared = true;
            res.status(200);
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
        fields: {
            "documents.$": 1
        }
    },
    (err, doc) => {
        if (err) {
            res.status(400).json({
                error: MSG.updateFailed
            })
        }
        else {
            doc.documents[0].shared = false;
            res.status(200);
        }
    });
}

module.exports.getSharedDoc = async (userid, noteid) => {
    let result = await User.findOne({
        "_id": userid,
        "documents._id": noteid,
        "documents.shared": true
    });
    if (result == null)
        return false;
    let shared = result.documents.id(noteid);
    if (shared == null)
        return false;
    return true;
}

module.exports.share = (req, res) => {
    User.findOne({
        "_id": req.userid,
        "documents._id": req.noteid,
        "documents.shared": true
    },
    async (err, doc) => {
        let shared = doc.documents.id(req.noteid);
        if (err || doc == undefined || shared == null) {
            res.status(400).json({
                error: MSG.noteNotFound
            });
        }
        else {
            if (req.user._id != req.userid) {
                let id = `${req.userid}:${req.noteid}`;
                await User.findOneAndUpdate(
                    {
                        "_id": req.user._id
                    },
                    {
                        "$addToSet": {
                            "sharedWithMe": id
                        }
                    }
                );
            }
            res.status(200).json(shared);
        }
    });
}