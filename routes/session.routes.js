'use strict';

const express = require('express');
const { issueRefreshToken, refreshAccessToken, revokeRefreshToken } = require('../controllers/sessionController');

const router = express.Router();

router.post('/issue', issueRefreshToken);
router.post('/refresh', refreshAccessToken);
router.post('/revoke', revokeRefreshToken);

module.exports = router;
