import cron from 'node-cron';
import { prisma } from '../config/db.config';
import { sendEmail, emailTemplates } from '../services/email.service';
import { logger } from '../utils/logger.utils';

// Every Monday at 10:00
export const startRepeatCustomerReminderJob = (): void => {
  cron.schedule('0 10 * * 1', async () => {
    logger.info('[JOB] repeatCustomerReminder: running');
    try {
      const cutoff = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

      const users = await prisma.user.findMany({
        where: {
          role: 'USER',
          isActive: true,
          orders: {
            some: { paymentStatus: 'PAID' },
            every: { createdAt: { lt: cutoff } },
          },
        },
        select: { email: true, firstName: true },
      });

      for (const user of users) {
        await sendEmail({
          to: user.email,
          subject: 'We Miss You at BRM Jewellery',
          html: emailTemplates.reEngagementEmail(user.firstName),
        });
        logger.info(`[JOB] repeatCustomerReminder: sent to ${user.email}`);
      }
    } catch (e) {
      logger.error(`[JOB] repeatCustomerReminder error: ${(e as Error).message}`);
    }
  }, { timezone: 'Europe/London' });

  logger.info('[JOB] repeatCustomerReminder: scheduled (Monday 10:00 London)');
};
