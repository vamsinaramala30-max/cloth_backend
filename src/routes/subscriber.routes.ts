import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { subscribe, unsubscribe, listSubscribers } from '../controllers/subscriber.controller';
import adminAuth from '../middleware/adminAuth';

const subscriberLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 429, message: 'Too many subscription attempts. Try again later.' },
});

const router = Router();

router.post('/subscribe', subscriberLimiter, subscribe);
router.post('/unsubscribe', subscriberLimiter, unsubscribe);
router.get('/', adminAuth, listSubscribers);

export default router;
