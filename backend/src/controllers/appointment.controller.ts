import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.utils';
import { sendSuccess } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import { getPagination, buildPaginationMeta } from '../utils/pagination.utils';
import * as appointmentService from '../services/appointment.service';

const mapAppointmentResponse = (appointment: any) => {
  if (!appointment) return appointment;
  let preferredDate = '';
  let preferredTime = '';
  try {
    if (appointment.date) {
      const dateObj = new Date(appointment.date);
      preferredDate = dateObj.toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
      preferredTime = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/London' });
    }
  } catch (err) {
    // Ignore invalid dates
  }
  return {
    ...appointment,
    preferredDate,
    preferredTime,
    message: appointment.notes || '',
  };
};

const mapAppointmentsResponse = (appointments: any[]) => {
  return appointments.map(mapAppointmentResponse);
};

export const bookAppointment = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await appointmentService.createAppointment(req.body, req.user?.id);
  sendSuccess(res, mapAppointmentResponse(appointment), 'Appointment request submitted', HTTP_STATUS.CREATED);
});

export const getAppointments = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req);
  const { appointments, total } = await appointmentService.getAppointments(pagination, {
    status: req.query.status as string,
    from: req.query.from as string,
    to: req.query.to as string,
    search: req.query.search as string,
    type: req.query.type as string,
  });
  sendSuccess(res, mapAppointmentsResponse(appointments), 'Appointments retrieved', HTTP_STATUS.OK, buildPaginationMeta(total, pagination.page, pagination.limit));
});

export const getAppointmentById = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await appointmentService.getAppointmentById(req.params.id);
  sendSuccess(res, mapAppointmentResponse(appointment), 'Appointment retrieved');
});

export const updateAppointment = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await appointmentService.updateAppointment(req.params.id, req.body);
  sendSuccess(res, mapAppointmentResponse(appointment), 'Appointment updated');
});

export const cancelAppointment = asyncHandler(async (req: Request, res: Response) => {
  await appointmentService.cancelAppointment(req.params.id);
  sendSuccess(res, null, 'Appointment cancelled');
});
