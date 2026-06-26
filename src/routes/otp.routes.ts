import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { sendOtp, verifyOtp } from '../controllers/otp.controller';
import env from '../config/env';

const otpLimiter = rateLimit({
  windowMs: env.OTP_RATE_LIMIT_WINDOW_MS,
  max: env.OTP_RATE_LIMIT_PER_WINDOW,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 429, message: 'Too many OTP requests, try again later.' },
});

const router = Router();

router.post('/send', otpLimiter, sendOtp);
router.post('/verify', otpLimiter, verifyOtp);

export default router;
