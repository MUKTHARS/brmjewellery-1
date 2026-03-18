// Redis removed — caching is handled directly via the database (Prisma)
export const TTL = {
  METAL_PRICES: 360,
  SESSION: 900,
  CART_GUEST: 86400,
  DEFAULT: 3600,
} as const;
