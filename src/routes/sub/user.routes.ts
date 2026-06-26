import { Router } from 'express';
import { getMe, updateProfile, addAddress, logout } from '../../controllers/user.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, updateProfile);
router.patch('/profile', authenticate, updateProfile);
router.post('/addresses', authenticate, addAddress);
router.post('/logout', authenticate, logout);

export default router;
