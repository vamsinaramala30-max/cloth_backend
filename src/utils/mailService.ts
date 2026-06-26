import nodemailer from 'nodemailer';
import env from '../config/env';

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

// Lazy transporter creation
let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter(): ReturnType<typeof nodemailer.createTransport> {
  if (transporter) return transporter;

  if (env.SMTP_HOST && env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  } else {
    // Console transporter for development
    transporter = {
      sendMail: async (opts: MailOptions) => {
        console.log('[mailService] Pretend sendMail:', opts);
        return true;
      },
    } as unknown as ReturnType<typeof nodemailer.createTransport>;
  }

  return transporter;
}

export async function sendWelcomeEmail(opts: MailOptions): Promise<boolean> {
  const t = getTransporter();
  const from = env.EMAIL_FROM ?? 'noreply@rare-rab-it.local';
  try {
    await t.sendMail({ from, ...opts });
    return true;
  } catch (err) {
    console.error('[mailService.sendWelcomeEmail]', err);
    return false;
  }
}
