import { Router } from 'express';

const router = Router();

// Placeholder to fix router wiring.
router.get('/health', (_req, res) => {
  res.status(200).json({ success: true, status: 'order sub-route ok' });
});

export default router;
