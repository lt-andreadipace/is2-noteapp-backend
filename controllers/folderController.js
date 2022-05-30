'use strict';

const req = require('express/lib/request');
const mongoose = require('mongoose');
const User = mongoose.model('User');

let MSG = {
    folderNotFound: "Cartella non trovata",
    creationFailed: "Creazione cartella fallita",
    folderDeletedFailed: "Eliminazione cartella fallita",
    rootFolder: "Non puoi eliminare la root"
}

module.exports.read_folders = (req, res) => {
    User.findById(req.user._id, "folders rootFolder -_id", (err, docs) => {
        res.json(docs);
    });
};

module.exports.create_folder = (req, res) => {
    // check se esiste una cartella con lo stesso nome
    User.findOneAndUpdate({
        _id: req.user._id
    }, {
        $push : {
            'folders' : {
                name: req.body.name,
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
                error: MSG.creationFailed
            });
        }
        else {
            let last = doc.folders[doc.folders.length - 1];
            res.json(last);
        }
        
    });
};

module.exports.modify_folder = (req, res) => {
    User.findOneAndUpdate(
        { 
            "_id": req.user._id,
            "folders._id": req.folderid
        },
        {
            $set: {
                "folders.$.name": req.body.newname,
                "folders.$.parent": req.body.newparent
            }
        },
        {
            "fields": { "folders.$":1 }
        },
        (err, doc) => {
            if (err) {
                res.status(400).json({
                    error: MSG.folderNotFound
                });
            }
            else {
                res.status(200).json({
                    modify: "ok"
                });
            }
        }
    )
}

function createTree(userid) {
    return new Promise((resolve, reject) => {
        User.findById(userid, "documents folders rootFolder", 
            (err, doc) => {
                let tree = {};
                tree[doc.rootFolder._id] = [];
                doc.folders.forEach(folder => {
                    tree[folder._id] = [];
                });
                doc.folders.forEach(folder => {
                    tree[folder.parent].push({
                        isFolder: true,
                        id: folder._id,
                        name:  folder.name
                    });
                });
                doc.documents.forEach(document => {
                    tree[document.parent].push({
                        isFolder: false,
                        id: document._id
                    })
                });

                printTree(tree, { id: doc.rootFolder._id, isFolder: true }, 0);
                resolve(tree);
            }
        )
    });
}

function printTree(tree, node, inc) {
    if (node.isFolder) {
        console.log("\t".repeat(inc) + node.id + " " + node.name);
    }
    else {
        console.log("\t".repeat(inc) + node.id);
    }
    if (node.isFolder) {
        tree[node.id].forEach(son => {
            printTree(tree, son, inc + 1);
        });
    }
}

function findAllIds(tree, root) {
    let documents = [];
    let folders = [];
    let toVisit = [];
    toVisit.push(root);
    while (toVisit.length) {
        let e = toVisit.shift();
        if (e.isFolder) {
            folders.push(e.id);
            tree[e.id].forEach(son => {
                toVisit.push(son);
            })
        }
        else {
            documents.push(e.id);
        }
    }
    return {
        documents: documents,
        folders: folders
    };
}

module.exports.delete_folder = (req, res) => {
    createTree(req.user._id)
    .then(tree => {
        if (req.user.rootFolder == req.folderid) {
            res.status(400).json({
                error: MSG.rootFolder
            });
            return;
        }
        let toDelete = findAllIds(tree, {
            id: req.folderid,
            isFolder: true
        });
        console.log(toDelete);
        User.findOneAndUpdate({
            _id: req.user._id
        },
            {
                $pull: {
                    "documents": {
                        "_id": {
                            $in: toDelete.documents
                        }
                    },
                    "folders": {
                        "_id": {
                            $in: toDelete.folders
                        }
                    }
                }
            },
            {
                returnOriginal: false
            },
            (err, doc) => {
                if (err) {
                    res.status(400).json({
                        error: MSG.folderDeletedFailed
                    });
                }
                else {
                    res.status(200).json({
                        deleted: "ok"
                    });
                }
            }
        );
    })
    .catch(err => {
        console.log(err);
    });
}
