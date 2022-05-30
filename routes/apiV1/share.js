'use strict';

const express = require('express');
const router = express.Router();

const shareHandler = require('../../controllers/shareController');

const bearerMiddleware = require('./middleware/bearer');
const noteidMiddleware = require('./middleware/noteid');
const useridMiddleware = require('./middleware/userid');

router.get('/', bearerMiddleware.userCheck, shareHandler.get_shared);

router.post('/public/:noteid',
    [
        bearerMiddleware.userCheck,
        noteidMiddleware.checkNoteID
    ],
    shareHandler.make_public
);
router.post('/private/:noteid', 
    [
        bearerMiddleware.userCheck,
        noteidMiddleware.checkNoteID
    ],
    shareHandler.make_private
);

router.get('/share/:userid/:noteid',
    [
        bearerMiddleware.userCheck,
        useridMiddleware.checkUserID,
        noteidMiddleware.checkNoteID
    ],
    shareHandler.share
);

module.exports = router;