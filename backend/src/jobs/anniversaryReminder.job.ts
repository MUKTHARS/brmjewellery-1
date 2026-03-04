import cron from 'node-cron';
import { prisma } from '../config/db.config';
import { sendEmail, emailTemplates } from '../services/email.service';
import { logger } from '../utils/logger.utils';

// Daily at 09:00 UK
export const startAnniversaryReminderJob = (): void => {
  cron.schedule('0 9 * * *', async () => {
    logger.info('[JOB] anniversaryReminder: running');
    try {
      const today = new Date();
      const orders = await prisma.order.findMany({
        where: {
          paymentStatus: 'PAID',
          createdAt: {
            gte: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()),
            lt: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate() + 1),
          },
        },
        include: {
          user: { select: { email: true, firstName: true } },
          items: { include: { product: { select: { title: true } } }, take: 1 },
        },
      });

      for (const order of orders) {
        const productTitle = order.items[0]?.product?.title ?? 'your jewellery';
        await sendEmail({
          to: order.user.email,
          subject: 'One Year with Your BRM Jewellery — We Hope You Love It',
          html: emailTemplates.anniversaryReminder(order.user.firstName, productTitle),
        });
        logger.info(`[JOB] anniversaryReminder: sent to ${order.user.email}`);
      }
    } catch (e) {
      logger.error(`[JOB] anniversaryReminder error: ${(e as Error).message}`);
    }
  }, { timezone: 'Europe/London' });

  logger.info('[JOB] anniversaryReminder: scheduled (daily 09:00 London)');
};
