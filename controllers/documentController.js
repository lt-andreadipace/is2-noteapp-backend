'use strict';

const mongoose = require('mongoose');
const User = mongoose.model('User');
const Delta = require('quill-delta');

let MSG = {
    noteNotFound: "Nota non trovata",
    updateFailed: "Salvataggio nota fallito"
}

module.exports.read_notes = (req, res) => {
    User.findById(req.user._id, "documents -_id", (err, docs) => {
        res.json(docs);
    })
};

module.exports.create_note = (req, res) => {
    console.log(req.body.parent);
    User.findOneAndUpdate({
        _id: req.user._id
    }, {
        $push : {
            'documents' : {
                name: req.body.title,
                parent: mongoose.Types.ObjectId(req.body.parent)
            }
        }
    },
    {
        returnOriginal: false
    },
    (err, doc) => {
        if (err) {
            res.status(400).json({
                error: MSG.updateFailed
            });
        }
        else {
            let last = doc.documents[doc.documents.length - 1];
            res.json(last);
        }
        
    });
};

module.exports.read_note = (req, res) => {
    User.findOne(
        { 
            "_id": req.user._id,
            "documents._id": mongoose.Types.ObjectId(req.noteid)
        },
        {
            "documents.$": 1
        },
        (err, doc) => {
            if (err) {
                res.status(400).json({
                    error: MSG.noteNotFound
                });
            }
            else {
                res.status(200).json(doc.documents[0]);
            }
        }
    );

};

module.exports.update_note = (req, res) => {
    User.findOne(
        { 
            "_id": req.user._id,
            "documents._id": req.noteid
        },
        {
            "documents.$": 1
        },
        (err, doc) => {
            if (err) {
                res.status(400).json({
                    error: MSG.noteNotFound
                });
                return;
            }
            let content = doc.documents[0].content;
            let delta_db = new Delta(content);
            let delta_update = new Delta(req.body.ops);
            let delta_final = delta_db.compose(delta_update);
            User.findOneAndUpdate({
                    "_id": req.user._id,
                    "documents._id": req.noteid
                },
                {
                    $set: {
                        "documents.$.name": req.body.title,
                        "documents.$.content": JSON.stringify(delta_final),
                        "documents.$.updated": Date.now()
                    }
                },
                {
                    // returnOriginal: false, // error
                    "fields": { "documents.$":1 }
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
                }
            );
        }
    );
};

module.exports.delete_note = (req, res) => {
    User.findOneAndUpdate({
        _id: req.user._id
    },
        {
            $pull: {
                "documents": {
                    "_id": req.noteid
                }
            }
        },
        (err, doc) => {
            if (err) {
                res.status(400).json({
                    error: MSG.noteNotFound
                })
            }
            else {
                res.status(200).json({
                    deleted: "ok"
                });
            }
        }
    );
}

module.exports.move_document = (req, res) => {
    User.findOneAndUpdate({
        "_id": req.user._id,
        "documents._id": req.noteid
    },
    {
        $set: {
            "documents.$.parent": req.body.newtitle
        }
    },
    {
        // returnOriginal: false, // error
        "fields": { "documents.$":1 }
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