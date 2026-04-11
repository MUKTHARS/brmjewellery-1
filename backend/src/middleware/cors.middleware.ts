import cors from 'cors';
import { env } from '../config/env.config';

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    const allowed = [
      env.FRONTEND_URL,
      'https://brmjewellery.co.uk',
      'https://www.brmjewellery.co.uk',
      'http://localhost:4002',
      'http://localhost:3000',
      'http://localhost:3001',
    ];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});
