import { prisma } from '../config/db.config';
import { AppError } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import { ERROR_MESSAGES } from '../constants/errorMessages.constants';
import { PaginationOptions } from '../utils/pagination.utils';

export const getOrders = async (
  pagination: PaginationOptions,
  filters: {
    status?: string;
    paymentStatus?: string;
    userId?: string;
    search?: string;
    from?: string;
    to?: string;
    sortBy?: string;
    order?: string;
  }
) => {
  const where: Record<string, unknown> = {};

  if (filters.status) where.fulfillmentStatus = filters.status;
  if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;
  if (filters.userId) where.userId = filters.userId;
  if (filters.from || filters.to) {
    where.createdAt = {
      ...(filters.from ? { gte: new Date(filters.from) } : {}),
      ...(filters.to ? { lte: new Date(filters.to) } : {}),
    };
  }
  if (filters.search) {
    where.OR = [
      { orderNumber: { contains: filters.search, mode: 'insensitive' } },
      { user: { email: { contains: filters.search, mode: 'insensitive' } } },
      { user: { firstName: { contains: filters.search, mode: 'insensitive' } } },
    ];
  }

  const orderBy: Record<string, string> = {};
  if (filters.sortBy) orderBy[filters.sortBy] = filters.order || 'desc';
  else orderBy['createdAt'] = 'desc';

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        items: { include: { product: { select: { title: true, sku: true } } } },
        invoice: { select: { id: true, pdfUrl: true, invoiceNumber: true } },
        shipment: { select: { courier: true, trackingNumber: true, status: true } },
      },
    }),
  ]);

  return { orders, total };
};

export const getOrderById = async (id: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      items: { include: { product: { select: { title: true, sku: true, images: { where: { isPrimary: true }, take: 1 } } } } },
      invoice: true,
      shipment: true,
    },
  });
  if (!order) throw new AppError(ERROR_MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  return order;
};

export const updateOrderStatus = async (
  id: string,
  data: { fulfillmentStatus?: string; paymentStatus?: string; notes?: string }
) => {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new AppError(ERROR_MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  return prisma.order.update({
    where: { id },
    data: {
      ...(data.fulfillmentStatus && { fulfillmentStatus: data.fulfillmentStatus as any }),
      ...(data.paymentStatus && { paymentStatus: data.paymentStatus as any }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      items: true,
      invoice: true,
      shipment: true,
    },
  });
};
