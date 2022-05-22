'use strict';

const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

const folderHandler = require('../../controllers/folderController');

function checkUser(req, res, next) {
    let bearerToken = req.headers['authorization'];
    if (bearerToken) {
        const bearer = bearerToken.split(" ");
        const token = bearer[1];
        jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
            if (err) {
                res.status(403).json({
                    error: "Bearer token invalido"
                });
                return;
            }
            req.token = token;
            req.user = decoded;
            next();
        });
    }
    else {
        res.status(401).json({
            error: "Manca il token Bearer"
        });
    }
}

function checkFolderID(req, res, next) {
    let folderid = req.params.folderid;
    if (folderid) {
        req.folderid = folderid;
        next();
    }
    else {
        res.status(400).json({
            error: "Manca l'id della cartella"
        });
    }
}

router.use(checkUser);

router.get('/', folderHandler.read_folders);

router.post('/', folderHandler.create_folder);

router.post('/:folderid', checkFolderID, folderHandler.move_folder);

router.put('/:folderid', checkFolderID, folderHandler.rename_folder);

router.delete('/:folderid', checkFolderID, folderHandler.delete_folder);

module.exports = router;