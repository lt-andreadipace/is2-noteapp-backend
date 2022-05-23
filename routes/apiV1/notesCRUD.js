'use strict';

const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

const documentHandler = require('../../controllers/documentController');

const bearerMiddleware = require('./middleware/bearer');
const noteidMiddleware = require('./middleware/noteid');

router.use(bearerMiddleware.userCheck);

router.use(checkUser);

router.get('/', documentHandler.read_notes);

router.post('/', documentHandler.create_note);

router.get('/:noteid', noteidMiddleware.checkNoteID, documentHandler.read_note);

router.put('/:noteid', noteidMiddleware.checkNoteID, documentHandler.update_note);

router.delete('/:noteid', noteidMiddleware.checkNoteID, documentHandler.delete_note);

module.exports = router;