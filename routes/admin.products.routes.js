const express = require('express');

const adminAuth = require('../middleware/adminAuth');
const { createProduct, listProductsAdmin } = require('../controllers/adminproductscontroller');

const subRouter = express.Router();

// Owner-only/admin-only product management
subRouter.post('/', adminAuth, createProduct);
subRouter.get('/', adminAuth, listProductsAdmin);

module.exports = subRouter;

