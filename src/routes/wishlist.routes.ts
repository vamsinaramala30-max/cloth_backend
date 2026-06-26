import { Router } from 'express';
import { addToWishlist, removeFromWishlist, getWishlist } from '../controllers/wishlist.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, addToWishlist);
router.delete('/', authenticate, removeFromWishlist);
router.get('/', authenticate, getWishlist);

export default router;
