import { Router } from 'express';
import { addToCart, getCart, updateCartItem, clearCart } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, addToCart);
router.get('/', authenticate, getCart);
router.patch('/:itemId', authenticate, updateCartItem);
router.delete('/', authenticate, clearCart);

export default router;
