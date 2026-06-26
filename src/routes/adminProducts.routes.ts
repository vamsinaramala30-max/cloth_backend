import { Router } from 'express';
import adminAuth from '../middleware/adminAuth';
import { createProduct, listProductsAdmin } from '../controllers/adminProducts.controller';

const router = Router();

// Owner-only/admin-only product management
router.post('/', adminAuth, createProduct);
router.get('/', adminAuth, listProductsAdmin);

export default router;
