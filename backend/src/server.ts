import { env } from './config/env.config';
import app from './app';
import { connectDatabase, disconnectDatabase } from './config/db.config';
import { verifyMailConnection } from './config/nodemailer.config';
import { fetchAndCacheMetalPrices } from './services/metalPrice.service';
import { startMetalPriceSyncJob } from './jobs/metalPriceSync.job';
import { startAnniversaryReminderJob } from './jobs/anniversaryReminder.job';
import { startRepeatCustomerReminderJob } from './jobs/repeatCustomerReminder.job';
import { startAppointmentReminderJob } from './jobs/appointmentReminder.job';
import { startShipmentTrackingJob } from './jobs/shipmentTracking.job';
import { logger } from './utils/logger.utils';

const start = async (): Promise<void> => {
  try {
    await connectDatabase();
    await verifyMailConnection();

    // Warm up metal prices on startup
    await fetchAndCacheMetalPrices();

    // Start cron jobs
    startMetalPriceSyncJob();
    startAnniversaryReminderJob();
    startRepeatCustomerReminderJob();
    startAppointmentReminderJob();
    startShipmentTrackingJob();

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 BRM Jewellery API running on port ${env.PORT} [${env.NODE_ENV}]`);
      logger.info(`📡 API: http://localhost:${env.PORT}/api/${env.API_VERSION}`);
    });

    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`\n${signal} received — shutting down gracefully`);
      server.close(async () => {
        await disconnectDatabase();
        logger.info('✅ Server shut down');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

start();
