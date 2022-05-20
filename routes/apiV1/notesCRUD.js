'use strict';

const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

const documentHandler = require('../../controllers/documentController');

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

function checkNoteID(req, res, next) {
    let noteid = req.params.noteid;
    if (noteid) {
        req.noteid = noteid;
        next();
    }
    else {
        res.status(400).json({
            error: "Manca l'id della nota"
        });
    }
}

router.use(checkUser);

router.get('/', documentHandler.read_notes);

router.post('/', documentHandler.create_note);

router.get('/:noteid', checkNoteID, documentHandler.read_note);

router.put('/:noteid', checkNoteID, documentHandler.update_note);

router.delete('/:noteid', checkNoteID, documentHandler.delete_note);

module.exports = router;