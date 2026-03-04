import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';

export const validate =
  (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = (result.error as ZodError).flatten().fieldErrors;
      sendError(res, 'Validation failed', HTTP_STATUS.BAD_REQUEST, errors);
      return;
    }
    req[source] = result.data;
    next();
  };
