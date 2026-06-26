import { Router } from 'express';
import { getProducts, getProductById, getFilters } from '../controllers/product.controller';

const router = Router();

// Public catalog endpoints
router.get('/filters', getFilters);
router.get('/slug/:id', getProductById);
router.get('/:id', getProductById);
router.get('/', getProducts);

export default router;
