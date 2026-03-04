import nodemailer from 'nodemailer';
import { env } from './env.config';

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const verifyMailConnection = async (): Promise<void> => {
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified');
  } catch (error) {
    console.warn('⚠️  SMTP connection failed (emails will not be sent):', (error as Error).message);
  }
};

export const DEFAULT_FROM = env.EMAIL_FROM;

// ── Phase 2 (SendGrid — commented out) ──────────────────────────
// import sgMail from '@sendgrid/mail';
// sgMail.setApiKey(env.SENDGRID_API_KEY);
// export { sgMail };
