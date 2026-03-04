import { Router } from 'express';
import * as appointmentController from '../controllers/appointment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createAppointmentSchema, updateAppointmentSchema } from '../validators/appointment.validator';

const router = Router();

// Public / user
router.post('/', validate(createAppointmentSchema), appointmentController.bookAppointment);

// Admin
router.get('/', authenticate, requireAdmin, appointmentController.getAppointments);
router.get('/:id', authenticate, requireAdmin, appointmentController.getAppointmentById);
router.patch('/:id', authenticate, requireAdmin, validate(updateAppointmentSchema), appointmentController.updateAppointment);
router.delete('/:id/cancel', authenticate, requireAdmin, appointmentController.cancelAppointment);

export default router;
