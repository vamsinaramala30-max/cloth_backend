import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { logout } from '../controllers/user.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);

export default router;
