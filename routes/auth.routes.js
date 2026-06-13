const express = require('express');
const { register, login } = require('../controllers/authcontroller');
const { authenticate } = require('../middleware/auth');
const { logout } = require('../controllers/usercontroller');

const subRouter = express.Router();

subRouter.post('/register', register);
subRouter.post('/login', login);
subRouter.post('/logout', authenticate, logout);

module.exports = subRouter;

