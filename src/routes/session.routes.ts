import { Router } from 'express';
import {
  issueRefreshToken,
  refreshAccessToken,
  revokeRefreshToken,
} from '../controllers/session.controller';

const router = Router();

router.post('/issue', issueRefreshToken);
router.post('/refresh', refreshAccessToken);
router.post('/revoke', revokeRefreshToken);

export default router;
