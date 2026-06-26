import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import Order from '../models/order';

const router = Router();

router.get('/history', authenticate, async (req, res) => {
  try {
    const trackingTree = await Order.find({ user: req.user?.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: trackingTree });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get orders';
    res.status(500).json({ success: false, message });
  }
});

export default router;
