'use strict';

const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports.read_notes = (req, res) => {
    User.findById(req.user._id, "documents -_id", (err, docs) => {
        res.json(docs);
    })
};

module.exports.create_note = (req, res) => {
    User.findOneAndUpdate(req.user._id, {
        $push : {
            'documents' : {
                name: req.body.title
            }
        }
    }, (err, doc) => {
        res.json(doc.documents);
    });
};

module.exports.read_note = (req, res) => {
    User.findOne(
        { 
            "_id": req.user._id,
            "documents._id": req.noteid
        },
        "documents -_id",
        (err, doc) => {
            res.json(doc);
        }
    );

};

module.exports.update_note = (req, res) => {

};

module.exports.delete_note = (req, res) => {
    User.findOneAndUpdate(req.user._id,
        {
            $pull: {
                "documents": {
                    "_id": req.noteid
                }
            }
        },
        (err, doc) => {
            res.json({
                deleted: "ok"
            });
        }
    );
}