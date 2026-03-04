import { env } from './env.config';

export const METALS_API_CONFIG = {
  apiKey: env.METALS_API_KEY,
  baseUrl: env.METALS_API_BASE_URL,
  currency: 'GBP',
  symbols: ['XAU', 'XAG', 'XPT'], // Gold, Silver, Platinum
} as const;

export const TROY_OZ_TO_GRAMS = 31.1035;

export const PURITY_MULTIPLIERS: Record<string, number> = {
  '9k': 0.375,
  '14k': 0.585,
  '18k': 0.750,
  '22k': 0.916,
  '24k': 0.999,
  '925': 0.925,
  '950': 0.950,
};

export const METAL_DENSITY_G_CM3: Record<string, number> = {
  GOLD_9K: 11.5,
  GOLD_14K: 13.0,
  GOLD_18K: 15.5,
  GOLD_22K: 17.5,
  GOLD_24K: 19.3,
  SILVER_925: 10.4,
  PLATINUM_950: 21.0,
};
