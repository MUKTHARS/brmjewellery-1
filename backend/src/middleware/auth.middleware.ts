import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils';
import { sendError } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import { ERROR_MESSAGES } from '../constants/errorMessages.constants';
import { prisma } from '../config/db.config';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, firstName: true, lastName: true, isActive: true },
    });

    if (!user) {
      sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    if (!user.isActive) {
      sendError(res, ERROR_MESSAGES.ACCOUNT_DISABLED, HTTP_STATUS.FORBIDDEN);
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
  } catch {
    sendError(res, ERROR_MESSAGES.TOKEN_INVALID, HTTP_STATUS.UNAUTHORIZED);
  }
};
