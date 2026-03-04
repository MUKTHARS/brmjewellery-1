import cron from 'node-cron';
import { prisma } from '../config/db.config';
import { sendEmail, emailTemplates } from '../services/email.service';
import { formatUKDateTime } from '../utils/dateTime.utils';
import { logger } from '../utils/logger.utils';

// Daily at 08:00
export const startAppointmentReminderJob = (): void => {
  cron.schedule('0 8 * * *', async () => {
    logger.info('[JOB] appointmentReminder: running');
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
      const tomorrowEnd = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 1);

      const appointments = await prisma.appointment.findMany({
        where: {
          status: 'CONFIRMED',
          date: { gte: tomorrowStart, lt: tomorrowEnd },
          reminderSent: false,
        },
      });

      for (const appt of appointments) {
        await sendEmail({
          to: appt.email,
          subject: 'Appointment Reminder – BRM Jewellery',
          html: emailTemplates.appointmentReminder(
            appt.name,
            formatUKDateTime(appt.date),
            appt.appointmentType
          ),
        });
        await prisma.appointment.update({ where: { id: appt.id }, data: { reminderSent: true } });
        logger.info(`[JOB] appointmentReminder: sent to ${appt.email}`);
      }
    } catch (e) {
      logger.error(`[JOB] appointmentReminder error: ${(e as Error).message}`);
    }
  }, { timezone: 'Europe/London' });

  logger.info('[JOB] appointmentReminder: scheduled (daily 08:00 London)');
};
