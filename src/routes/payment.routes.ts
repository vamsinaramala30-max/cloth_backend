import { Router } from 'express';
import { createCheckoutSession } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/checkout', authenticate, createCheckoutSession);

export default router;
