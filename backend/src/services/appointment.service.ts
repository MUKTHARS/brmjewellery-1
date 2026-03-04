import { prisma } from '../config/db.config';
import { AppError } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import { ERROR_MESSAGES } from '../constants/errorMessages.constants';
import { PaginationOptions } from '../utils/pagination.utils';
import { sendEmail, emailTemplates } from './email.service';
import { formatUKDateTime } from '../utils/dateTime.utils';
import type { CreateAppointmentInput, UpdateAppointmentInput } from '../validators/appointment.validator';

export const createAppointment = async (data: CreateAppointmentInput, userId?: string) => {
  const appointmentDate = new Date(data.date);

  const appointment = await prisma.appointment.create({
    data: {
      userId: userId || null,
      name: data.name,
      email: data.email,
      phone: data.phone,
      appointmentType: data.appointmentType,
      date: appointmentDate,
      notes: data.notes,
    },
  });

  await sendEmail({
    to: data.email,
    subject: 'Appointment Request Received – BRM Jewellery',
    html: emailTemplates.appointmentConfirmation(
      data.name,
      formatUKDateTime(appointmentDate),
      data.appointmentType
    ),
  });

  return appointment;
};

export const getAppointments = async (
  pagination: PaginationOptions,
  filters: { status?: string; from?: string; to?: string }
) => {
  const where: Record<string, unknown> = {};
  if (filters.status) where.status = filters.status;
  if (filters.from || filters.to) {
    where.date = {
      ...(filters.from ? { gte: new Date(filters.from) } : {}),
      ...(filters.to ? { lte: new Date(filters.to) } : {}),
    };
  }

  const [total, appointments] = await Promise.all([
    prisma.appointment.count({ where }),
    prisma.appointment.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { date: 'asc' },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    }),
  ]);

  return { appointments, total };
};

export const getAppointmentById = async (id: string) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
  });
  if (!appointment) throw new AppError(ERROR_MESSAGES.APPOINTMENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  return appointment;
};

export const updateAppointment = async (id: string, data: UpdateAppointmentInput) => {
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) throw new AppError(ERROR_MESSAGES.APPOINTMENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      ...(data.status && { status: data.status as any }),
      ...(data.date && { date: new Date(data.date) }),
      ...(data.adminNotes !== undefined && { adminNotes: data.adminNotes }),
      ...(data.status === 'CONFIRMED' && !appointment.confirmationSent && { confirmationSent: true }),
    },
  });

  // Send confirmation email if status changed to CONFIRMED
  if (data.status === 'CONFIRMED' && !appointment.confirmationSent) {
    await sendEmail({
      to: appointment.email,
      subject: 'Appointment Confirmed – BRM Jewellery',
      html: emailTemplates.appointmentConfirmation(
        appointment.name,
        formatUKDateTime(updated.date),
        appointment.appointmentType
      ),
    });
  }

  return updated;
};

export const cancelAppointment = async (id: string): Promise<void> => {
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) throw new AppError(ERROR_MESSAGES.APPOINTMENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  await prisma.appointment.update({ where: { id }, data: { status: 'CANCELLED' } });
};
