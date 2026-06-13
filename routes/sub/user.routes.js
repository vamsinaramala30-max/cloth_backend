const express = require('express');
const { getMe, updateProfile, addAddress, logout } = require('../../controllers/usercontroller');
const { authenticate } = require('../../middleware/auth');

const subRouter = express.Router();

subRouter.get('/me', authenticate, getMe);
subRouter.patch('/profile', authenticate, updateProfile);
subRouter.post('/addresses', authenticate, addAddress);
subRouter.post('/logout', authenticate, logout);

module.exports = subRouter;

