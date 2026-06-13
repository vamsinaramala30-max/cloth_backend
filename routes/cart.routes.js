const express = require('express');
const { addToCart, getCart, updateCartItem, clearCart } = require('../controllers/cartcontroller');
const { authenticate } = require('../middleware/auth');

const subRouter = express.Router();

subRouter.post('/', authenticate, addToCart);
subRouter.get('/', authenticate, getCart);
subRouter.patch('/:itemId', authenticate, updateCartItem);
subRouter.delete('/', authenticate, clearCart);

module.exports = subRouter;
