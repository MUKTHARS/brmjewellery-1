import { prisma } from '../config/db.config';

export const subscribe = async (email: string) => {
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existing) {
    if (existing.isActive) return existing;
    return prisma.newsletterSubscriber.update({
      where: { email },
      data: { isActive: true, unsubscribedAt: null },
    });
  }
  return prisma.newsletterSubscriber.create({ data: { email } });
};

export const unsubscribe = async (email: string): Promise<void> => {
  await prisma.newsletterSubscriber.updateMany({
    where: { email },
    data: { isActive: false, unsubscribedAt: new Date() },
  });
};

export const getSubscribers = async () => {
  return prisma.newsletterSubscriber.findMany({
    where: { isActive: true },
    orderBy: { subscribedAt: 'desc' },
  });
};
