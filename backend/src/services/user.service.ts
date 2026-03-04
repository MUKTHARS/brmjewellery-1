import { prisma } from '../config/db.config';
import { AppError } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import { ERROR_MESSAGES } from '../constants/errorMessages.constants';
import { PaginationOptions } from '../utils/pagination.utils';

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, email: true, role: true, firstName: true, lastName: true,
      phone: true, isActive: true, lastLoginAt: true, createdAt: true,
      addresses: true,
      _count: { select: { orders: true, reviews: true, bespokeEnquiries: true } },
    },
  });
  if (!user) throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  return user;
};

export const getUsers = async (
  pagination: PaginationOptions,
  filters: { search?: string; role?: string; isActive?: string }
) => {
  const where: Record<string, unknown> = {};
  if (filters.role) where.role = filters.role;
  if (filters.isActive !== undefined) where.isActive = filters.isActive === 'true';
  if (filters.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, role: true, firstName: true, lastName: true,
        phone: true, isActive: true, lastLoginAt: true, createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
  ]);

  return { users, total };
};

export const updateUser = async (
  id: string,
  data: { firstName?: string; lastName?: string; phone?: string; isActive?: boolean; role?: string }
) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  return prisma.user.update({
    where: { id },
    data: {
      ...(data.firstName && { firstName: data.firstName }),
      ...(data.lastName && { lastName: data.lastName }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.role && { role: data.role as any }),
    },
    select: {
      id: true, email: true, role: true, firstName: true, lastName: true,
      phone: true, isActive: true, createdAt: true,
    },
  });
};

export const getUserOrderHistory = async (userId: string, pagination: PaginationOptions) => {
  const [total, orders] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.findMany({
      where: { userId },
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: { select: { title: true, sku: true } } } },
        invoice: { select: { pdfUrl: true, invoiceNumber: true } },
        shipment: { select: { courier: true, trackingNumber: true, status: true } },
      },
    }),
  ]);
  return { orders, total };
};
