import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform(Number),
  API_VERSION: z.string().default('v1'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379').transform(Number),
  REDIS_PASSWORD: z.string().optional(),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_PUBLISHABLE_KEY: z.string().min(1, 'STRIPE_PUBLISHABLE_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required'),

  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().default('587').transform(Number),
  SMTP_SECURE: z.string().default('false').transform((v) => v === 'true'),
  SMTP_USER: z.string().min(1, 'SMTP_USER is required'),
  SMTP_PASS: z.string().min(1, 'SMTP_PASS is required'),
  EMAIL_FROM: z.string().default('BRM Jewellery <noreply@brmjewellery.co.uk>'),

  UPLOAD_DIR: z.string().default('uploads'),
  MAX_FILE_SIZE: z.string().default('10485760').transform(Number),

  METALS_API_KEY: z.string().optional(),
  METALS_API_BASE_URL: z.string().default('https://metals-api.com/api'),

  ROYAL_MAIL_API_KEY: z.string().optional(),
  ROYAL_MAIL_BASE_URL: z.string().default('https://api.royalmail.com'),
  DHL_API_KEY: z.string().optional(),
  DHL_API_SECRET: z.string().optional(),
  DHL_BASE_URL: z.string().default('https://api.dhl.com'),
  FEDEX_API_KEY: z.string().optional(),
  FEDEX_API_SECRET: z.string().optional(),
  FEDEX_ACCOUNT_NUMBER: z.string().optional(),
  FEDEX_BASE_URL: z.string().default('https://apis.fedex.com'),

  FRONTEND_URL: z.string().default('http://localhost:3000'),

  ADMIN_EMAIL: z.string().default('admin@brmjewellery.co.uk'),
  ADMIN_PASSWORD: z.string().default('Admin@BRM2024!'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
