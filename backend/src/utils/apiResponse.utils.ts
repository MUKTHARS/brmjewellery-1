import { Response } from 'express';

interface ApiResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: ApiResponseMeta
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: unknown
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
};

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
