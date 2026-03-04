import cron from 'node-cron';
import { fetchAndCacheMetalPrices } from '../services/metalPrice.service';
import { logger } from '../utils/logger.utils';

// Every 5 minutes
export const startMetalPriceSyncJob = (): void => {
  cron.schedule('*/5 * * * *', async () => {
    logger.info('[JOB] metalPriceSync: running');
    await fetchAndCacheMetalPrices();
  });
  logger.info('[JOB] metalPriceSync: scheduled (every 5 min)');
};
