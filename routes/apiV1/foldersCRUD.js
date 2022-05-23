'use strict';

const express = require('express');
const router = express.Router();

const folderHandler = require('../../controllers/folderController');

const bearerMiddleware = require('./middleware/bearer');
const noteidMiddleware = require('./middleware/noteid');
const folderidMiddleware = require('./middleware/folderid');

router.use(bearerMiddleware.userCheck);

router.get('/', folderHandler.read_folders);

router.post('/', folderHandler.create_folder);

router.put('/:folderid', folderidMiddleware.checkFolderID, folderHandler.modify_folder);

router.delete('/:folderid', folderidMiddleware.checkFolderID, folderHandler.delete_folder);

module.exports = router;