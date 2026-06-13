const express = require('express');
const { getProducts, getProductById, getFilters } = require('../controllers/productcontroller');

const subRouter = express.Router();

// Public catalog endpoints
subRouter.get('/filters', getFilters);
subRouter.get('/:id', getProductById);
subRouter.get('/', getProducts);

module.exports = subRouter;

