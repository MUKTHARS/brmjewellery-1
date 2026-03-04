import { PrismaClient } from '@prisma/client';
import { env } from './env.config';

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  console.log('✅ PostgreSQL connected via Prisma');
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
