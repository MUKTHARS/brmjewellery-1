import cron from 'node-cron';
import { fetchAndCacheMetalPrices } from '../services/metalPrice.service';
import { logger } from '../utils/logger.utils';

// Runs 5 minutes after BRM Metals fetches from the external API (09:35, 10:35, 13:05, 15:05, 16:05, 17:35 UTC)
// Zero external API calls — reads from BRM Metals backend instead
export const startMetalPriceSyncJob = (): void => {
  const schedules = [
    '35 9 * * *',
    '35 10 * * *',
    '5 13 * * *',
    '5 15 * * *',
    '5 16 * * *',
    '35 17 * * *',
  ];

  const run = async () => {
    logger.info('[JOB] metalPriceSync: syncing from BRM Metals');
    await fetchAndCacheMetalPrices();
  };

  schedules.forEach((s) => cron.schedule(s, run));
  logger.info('[JOB] metalPriceSync: scheduled (5 min after BRM Metals fetches — no external API calls)');
};
