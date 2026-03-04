import { env } from './env.config';

export const SHIPPING_CONFIG = {
  ROYAL_MAIL: {
    apiKey: env.ROYAL_MAIL_API_KEY,
    baseUrl: env.ROYAL_MAIL_BASE_URL,
    services: {
      TRACKED_48: { code: 'TPS48', name: 'Royal Mail Tracked 48', daysMin: 2, daysMax: 3 },
      TRACKED_24: { code: 'TPS24', name: 'Royal Mail Tracked 24', daysMin: 1, daysMax: 2 },
      SPECIAL_DELIVERY: { code: 'SD1', name: 'Special Delivery Guaranteed', daysMin: 1, daysMax: 1 },
    },
  },
  DHL: {
    apiKey: env.DHL_API_KEY,
    apiSecret: env.DHL_API_SECRET,
    baseUrl: env.DHL_BASE_URL,
    services: {
      EXPRESS: { code: 'P', name: 'DHL Express', daysMin: 1, daysMax: 2 },
    },
  },
  FEDEX: {
    apiKey: env.FEDEX_API_KEY,
    apiSecret: env.FEDEX_API_SECRET,
    accountNumber: env.FEDEX_ACCOUNT_NUMBER,
    baseUrl: env.FEDEX_BASE_URL,
    services: {
      PRIORITY_OVERNIGHT: { code: 'PRIORITY_OVERNIGHT', name: 'FedEx Priority Overnight', daysMin: 1, daysMax: 1 },
    },
  },
} as const;

export const DEFAULT_SHIPPING_RATES = {
  ROYAL_MAIL_TRACKED_48: { price: 3.99, name: 'Royal Mail Tracked 48 (2-3 days)' },
  ROYAL_MAIL_TRACKED_24: { price: 5.99, name: 'Royal Mail Tracked 24 (1-2 days)' },
  ROYAL_MAIL_SPECIAL_DELIVERY: { price: 9.99, name: 'Special Delivery (Next day by 1pm)' },
  DHL_EXPRESS: { price: 12.99, name: 'DHL Express (1-2 days)' },
  FEDEX_PRIORITY: { price: 14.99, name: 'FedEx Priority Overnight' },
  FREE_SHIPPING_THRESHOLD: 100,
} as const;
