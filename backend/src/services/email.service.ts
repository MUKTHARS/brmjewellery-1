import { transporter, DEFAULT_FROM } from '../config/nodemailer.config';
import { logger } from '../utils/logger.utils';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; path: string }>;
}

export const sendEmail = async (opts: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: DEFAULT_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      attachments: opts.attachments,
    });
    logger.info(`Email sent to ${opts.to}: ${opts.subject}`);
  } catch (error) {
    logger.error(`Failed to send email to ${opts.to}: ${(error as Error).message}`);
  }
};

export const emailTemplates = {
  welcomeEmail: (firstName: string): string => `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 40px;">
      <h1 style="color: #C9A84C; font-size: 28px; margin-bottom: 8px; letter-spacing: 4px;">BRM JEWELLERY</h1>
      <hr style="border: none; border-top: 1px solid #C9A84C; margin-bottom: 30px;" />
      <h2 style="color: #1A1A1A; font-size: 20px;">Welcome, ${firstName}</h2>
      <p style="color: #6B6B6B; line-height: 1.8;">Thank you for creating an account with BRM Jewellery. We are delighted to welcome you to our community of discerning jewellery enthusiasts.</p>
      <p style="color: #6B6B6B; line-height: 1.8;">Explore our handcrafted collections or speak with our team about a bespoke commission.</p>
      <hr style="border: none; border-top: 1px solid #E5E5E5; margin: 30px 0;" />
      <p style="color: #6B6B6B; font-size: 12px;">BRM Jewellery · London, United Kingdom</p>
    </div>
  `,

  passwordReset: (firstName: string, resetUrl: string): string => `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 40px;">
      <h1 style="color: #C9A84C; font-size: 28px; margin-bottom: 8px; letter-spacing: 4px;">BRM JEWELLERY</h1>
      <hr style="border: none; border-top: 1px solid #C9A84C; margin-bottom: 30px;" />
      <h2 style="color: #1A1A1A; font-size: 20px;">Password Reset Request</h2>
      <p style="color: #6B6B6B; line-height: 1.8;">Hello ${firstName}, we received a request to reset your password.</p>
      <a href="${resetUrl}" style="display: inline-block; margin: 20px 0; padding: 14px 32px; background: #C9A84C; color: #fff; text-decoration: none; font-family: 'Didact Gothic', sans-serif; font-size: 14px; letter-spacing: 2px;">RESET PASSWORD</a>
      <p style="color: #6B6B6B; font-size: 13px;">This link expires in 1 hour. If you did not request a password reset, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #E5E5E5; margin: 30px 0;" />
      <p style="color: #6B6B6B; font-size: 12px;">BRM Jewellery · London, United Kingdom</p>
    </div>
  `,

  orderConfirmation: (orderNumber: string, customerName: string, totalGBP: number): string => `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 40px;">
      <h1 style="color: #C9A84C; font-size: 28px; margin-bottom: 8px; letter-spacing: 4px;">BRM JEWELLERY</h1>
      <hr style="border: none; border-top: 1px solid #C9A84C; margin-bottom: 30px;" />
      <h2 style="color: #1A1A1A; font-size: 20px;">Order Confirmed</h2>
      <p style="color: #6B6B6B; line-height: 1.8;">Dear ${customerName}, thank you for your order.</p>
      <p style="color: #1A1A1A;"><strong>Order Number:</strong> ${orderNumber}</p>
      <p style="color: #1A1A1A;"><strong>Total:</strong> £${totalGBP.toFixed(2)} (inc. VAT)</p>
      <p style="color: #6B6B6B; line-height: 1.8;">Your invoice is attached to this email. We will notify you when your order has been dispatched.</p>
      <hr style="border: none; border-top: 1px solid #E5E5E5; margin: 30px 0;" />
      <p style="color: #6B6B6B; font-size: 12px;">BRM Jewellery · London, United Kingdom</p>
    </div>
  `,

  bespokeEnquiryConfirmation: (name: string): string => `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 40px;">
      <h1 style="color: #C9A84C; font-size: 28px; margin-bottom: 8px; letter-spacing: 4px;">BRM JEWELLERY</h1>
      <hr style="border: none; border-top: 1px solid #C9A84C; margin-bottom: 30px;" />
      <h2 style="color: #1A1A1A; font-size: 20px;">Bespoke Enquiry Received</h2>
      <p style="color: #6B6B6B; line-height: 1.8;">Dear ${name}, thank you for your bespoke jewellery enquiry.</p>
      <p style="color: #6B6B6B; line-height: 1.8;">Our team will review your requirements and be in touch within 2 business days to discuss your vision and provide a personalised quote.</p>
      <hr style="border: none; border-top: 1px solid #E5E5E5; margin: 30px 0;" />
      <p style="color: #6B6B6B; font-size: 12px;">BRM Jewellery · London, United Kingdom</p>
    </div>
  `,

  appointmentConfirmation: (name: string, date: string, type: string): string => `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 40px;">
      <h1 style="color: #C9A84C; font-size: 28px; margin-bottom: 8px; letter-spacing: 4px;">BRM JEWELLERY</h1>
      <hr style="border: none; border-top: 1px solid #C9A84C; margin-bottom: 30px;" />
      <h2 style="color: #1A1A1A; font-size: 20px;">Appointment Confirmed</h2>
      <p style="color: #6B6B6B; line-height: 1.8;">Dear ${name}, your appointment has been confirmed.</p>
      <p style="color: #1A1A1A;"><strong>Type:</strong> ${type}</p>
      <p style="color: #1A1A1A;"><strong>Date & Time:</strong> ${date}</p>
      <p style="color: #6B6B6B; line-height: 1.8;">We look forward to seeing you. Please contact us if you need to make any changes.</p>
      <hr style="border: none; border-top: 1px solid #E5E5E5; margin: 30px 0;" />
      <p style="color: #6B6B6B; font-size: 12px;">BRM Jewellery · London, United Kingdom</p>
    </div>
  `,

  appointmentReminder: (name: string, date: string, type: string): string => `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 40px;">
      <h1 style="color: #C9A84C; font-size: 28px; margin-bottom: 8px; letter-spacing: 4px;">BRM JEWELLERY</h1>
      <hr style="border: none; border-top: 1px solid #C9A84C; margin-bottom: 30px;" />
      <h2 style="color: #1A1A1A; font-size: 20px;">Appointment Reminder</h2>
      <p style="color: #6B6B6B; line-height: 1.8;">Dear ${name}, this is a reminder of your upcoming appointment.</p>
      <p style="color: #1A1A1A;"><strong>Type:</strong> ${type}</p>
      <p style="color: #1A1A1A;"><strong>Date & Time:</strong> ${date}</p>
      <p style="color: #6B6B6B; line-height: 1.8;">We look forward to seeing you tomorrow.</p>
      <hr style="border: none; border-top: 1px solid #E5E5E5; margin: 30px 0;" />
      <p style="color: #6B6B6B; font-size: 12px;">BRM Jewellery · London, United Kingdom</p>
    </div>
  `,

  trackingUpdate: (customerName: string, orderNumber: string, trackingNumber: string, courier: string): string => `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 40px;">
      <h1 style="color: #C9A84C; font-size: 28px; margin-bottom: 8px; letter-spacing: 4px;">BRM JEWELLERY</h1>
      <hr style="border: none; border-top: 1px solid #C9A84C; margin-bottom: 30px;" />
      <h2 style="color: #1A1A1A; font-size: 20px;">Your Order Has Been Dispatched</h2>
      <p style="color: #6B6B6B; line-height: 1.8;">Dear ${customerName}, your order <strong>${orderNumber}</strong> has been dispatched.</p>
      <p style="color: #1A1A1A;"><strong>Courier:</strong> ${courier}</p>
      <p style="color: #1A1A1A;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
      <hr style="border: none; border-top: 1px solid #E5E5E5; margin: 30px 0;" />
      <p style="color: #6B6B6B; font-size: 12px;">BRM Jewellery · London, United Kingdom</p>
    </div>
  `,

  anniversaryReminder: (customerName: string, productTitle: string): string => `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 40px;">
      <h1 style="color: #C9A84C; font-size: 28px; margin-bottom: 8px; letter-spacing: 4px;">BRM JEWELLERY</h1>
      <hr style="border: none; border-top: 1px solid #C9A84C; margin-bottom: 30px;" />
      <h2 style="color: #1A1A1A; font-size: 20px;">One Year with Your BRM Piece</h2>
      <p style="color: #6B6B6B; line-height: 1.8;">Dear ${customerName}, it has been a year since you purchased <strong>${productTitle}</strong> from BRM Jewellery.</p>
      <p style="color: #6B6B6B; line-height: 1.8;">We hope it continues to bring you joy. Did you know we offer complimentary cleaning and inspection for your jewellery? Get in touch to book your appointment.</p>
      <hr style="border: none; border-top: 1px solid #E5E5E5; margin: 30px 0;" />
      <p style="color: #6B6B6B; font-size: 12px;">BRM Jewellery · London, United Kingdom</p>
    </div>
  `,

  reEngagementEmail: (customerName: string): string => `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 40px;">
      <h1 style="color: #C9A84C; font-size: 28px; margin-bottom: 8px; letter-spacing: 4px;">BRM JEWELLERY</h1>
      <hr style="border: none; border-top: 1px solid #C9A84C; margin-bottom: 30px;" />
      <h2 style="color: #1A1A1A; font-size: 20px;">We Miss You, ${customerName}</h2>
      <p style="color: #6B6B6B; line-height: 1.8;">It has been a while since your last visit. We have new collections you might love — from fine gold rings to bespoke commissions crafted just for you.</p>
      <p style="color: #6B6B6B; line-height: 1.8;">We would love to welcome you back.</p>
      <hr style="border: none; border-top: 1px solid #E5E5E5; margin: 30px 0;" />
      <p style="color: #6B6B6B; font-size: 12px;">BRM Jewellery · London, United Kingdom</p>
    </div>
  `,
};
