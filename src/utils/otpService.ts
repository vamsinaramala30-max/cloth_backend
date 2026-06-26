import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import env from '../config/env';

const OTP_LENGTH = 6;
export const OTP_TTL_MINUTES = env.OTP_EXPIRY_MINUTES;
const BCRYPT_SALT_ROUNDS = 12;

export function generateNumericOtp(length = OTP_LENGTH): string {
  const max = 10 ** length;
  const n = crypto.randomInt(0, max);
  return String(n).padStart(length, '0');
}

export async function hashOtp(otp: string): Promise<string> {
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  return bcrypt.hash(otp, salt);
}

export async function verifyOtpHash(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

interface EmailOtpOptions {
  toEmail: string;
  subject: string;
  html: string;
  text: string;
}

interface SmsOtpOptions {
  toPhone: string;
  text: string;
}

// Placeholder send hooks — implement provider wiring in your env
export async function sendEmailOtp(opts: EmailOtpOptions): Promise<boolean> {
  // TODO: integrate SendGrid / Mailgun / SES here.
  console.log('[otpService] sendEmailOtp ->', { toEmail: opts.toEmail, subject: opts.subject });
  return true;
}

export async function sendSmsOtp(opts: SmsOtpOptions): Promise<boolean> {
  // TODO: integrate Twilio / Vonage / Plivo here.
  console.log('[otpService] sendSmsOtp ->', { toPhone: opts.toPhone });
  return true;
}
