const express = require('express');
const { addToWishlist, removeFromWishlist, getWishlist } = require('../controllers/wishlistcontroller');
const { authenticate } = require('../middleware/auth');

const subRouter = express.Router();

subRouter.post('/', authenticate, addToWishlist);
subRouter.delete('/', authenticate, removeFromWishlist);
subRouter.get('/', authenticate, getWishlist);

module.exports = subRouter;
