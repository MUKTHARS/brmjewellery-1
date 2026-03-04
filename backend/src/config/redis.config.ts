import Redis from 'ioredis';
import { env } from './env.config';

export const TTL = {
  METAL_PRICES: 360,    // 6 minutes
  SESSION: 900,          // 15 minutes
  CART_GUEST: 86400,    // 24 hours
  DEFAULT: 3600,         // 1 hour
} as const;

const redisConfig = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  ...(env.REDIS_PASSWORD ? { password: env.REDIS_PASSWORD } : {}),
  retryStrategy: (times: number) => {
    if (times > 3) {
      console.error('❌ Redis connection failed after 3 retries');
      return null;
    }
    return Math.min(times * 200, 2000);
  },
  enableOfflineQueue: false,
};

export const redis = new Redis(redisConfig);

redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('error', (err) => console.error('❌ Redis error:', err.message));
redis.on('close', () => console.warn('⚠️  Redis connection closed'));

export async function connectRedis(): Promise<void> {
  if (redis.status === 'ready') return;
  await new Promise<void>((resolve, reject) => {
    redis.once('ready', resolve);
    redis.once('error', reject);
  });
}
