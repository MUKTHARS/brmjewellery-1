import morgan from 'morgan';
import { logger } from '../utils/logger.utils';
import { env } from '../config/env.config';

const stream = {
  write: (message: string) => logger.http(message.trim()),
};

export const requestLogger = morgan(
  env.NODE_ENV === 'production' ? 'combined' : 'dev',
  { stream }
);
