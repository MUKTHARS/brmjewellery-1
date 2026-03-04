import cron from 'node-cron';
import { pollAllShipments } from '../services/shipping.service';
import { logger } from '../utils/logger.utils';

// Every hour
export const startShipmentTrackingJob = (): void => {
  cron.schedule('0 * * * *', async () => {
    logger.info('[JOB] shipmentTracking: running');
    await pollAllShipments();
  });
  logger.info('[JOB] shipmentTracking: scheduled (hourly)');
};
