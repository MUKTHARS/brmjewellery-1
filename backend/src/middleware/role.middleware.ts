import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { sendError } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import { ERROR_MESSAGES } from '../constants/errorMessages.constants';

export const requireRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }
    if (!roles.includes(req.user.role as Role)) {
      sendError(res, ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
      return;
    }
    next();
  };
};

export const requireAdmin = requireRole(Role.ADMIN, Role.SUPERADMIN);
export const requireSuperAdmin = requireRole(Role.SUPERADMIN);
