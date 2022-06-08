'use strict';

const express = require('express');
const router = express.Router();

const documentHandler = require('../../controllers/documentController');

const bearerMiddleware = require('./middleware/bearer');
const noteidMiddleware = require('./middleware/noteid');
const useridMiddleware = require('./middleware/userid');

router.use(bearerMiddleware.userCheck);

router.get('/', documentHandler.read_notes);

router.post('/', documentHandler.create_note);

router.get('/:noteid', noteidMiddleware.checkNoteID, documentHandler.read_note);

router.put('/:noteid', noteidMiddleware.checkNoteID, documentHandler.update_note);

router.put('/:userid/:noteid', [useridMiddleware.checkUserID, noteidMiddleware.checkNoteID], documentHandler.update_shared_note);

router.delete('/:noteid', noteidMiddleware.checkNoteID, documentHandler.delete_note);

module.exports = router;