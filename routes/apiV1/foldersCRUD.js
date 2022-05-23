'use strict';

const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

const folderHandler = require('../../controllers/folderController');

const bearerMiddleware = require('./middleware/bearer');
const folderidMiddleware = require('./middleware/folderid');

router.use(bearerMiddleware.userCheck);

router.get('/', folderHandler.read_folders);

router.post('/', folderHandler.create_folder);

router.post('/:folderid', folderidMiddleware.checkFolderID, folderHandler.move_folder);

router.put('/:folderid', folderidMiddleware.checkFolderID, folderHandler.rename_folder);

router.delete('/:folderid', folderidMiddleware.checkFolderID, folderHandler.delete_folder);

module.exports = router;