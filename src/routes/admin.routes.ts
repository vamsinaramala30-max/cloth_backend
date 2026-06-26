import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ success: true, status: 'admin ok' });
});

router.get('/analytics', authenticate, authorize('admin', 'superadmin'), getDashboardAnalytics);

export default router;
