import { prisma } from '../config/db.config';
import { AppError } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import { ERROR_MESSAGES } from '../constants/errorMessages.constants';
import { PaginationOptions } from '../utils/pagination.utils';
import type { CreateOrderInput } from '../validators/order.validator';

const FREE_SHIPPING_THRESHOLD = 100;
const SHIPPING_COST = 5.99;
const VAT_RATE = 0.2;

export const createOrder = async (userId: string, data: CreateOrderInput) => {
  const productIds = data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });
  if (products.length !== productIds.length) {
    throw new AppError('One or more products are unavailable', HTTP_STATUS.BAD_REQUEST);
  }

  const lineItems = data.items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return {
      productId: item.productId,
      quantity: item.quantity,
      priceAtPurchaseGBP: Number(product.baseCost),
      productTitle: product.title,
      productSku: product.sku,
      metalType: product.metalType ?? undefined,
      carat: product.carat ?? undefined,
      weightGrams: product.weightGrams ? Number(product.weightGrams) : undefined,
      variantId: item.variantId ?? undefined,
      finishName: item.finishName ?? undefined,
      ringWidth: item.ringWidth ?? undefined,
      ringProfile: item.ringProfile ?? undefined,
      ringWeight: item.ringWeight ?? undefined,
      ringSize: item.ringSize ?? undefined,
      engravingText: item.engravingText ?? undefined,
      engravingFont: item.engravingFont ?? undefined,
      ringFinish: item.ringFinish ?? undefined,
    };
  });

  const subtotal = parseFloat(lineItems.reduce((s, i) => s + i.priceAtPurchaseGBP * i.quantity, 0).toFixed(2));
  const vatAmount = parseFloat((subtotal * VAT_RATE).toFixed(2));
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = parseFloat((subtotal + vatAmount + shippingCost).toFixed(2));

  const orderCount = await prisma.order.count();
  const d = new Date();
  const orderNumber = `BRM-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(orderCount + 1).padStart(4, '0')}`;

  return prisma.order.create({
    data: {
      orderNumber,
      userId,
      subtotalGBP: subtotal,
      vatGBP: vatAmount,
      totalGBP: total,
      shippingCostGBP: shippingCost,
      shippingAddress: data.shippingAddress as any,
      deliveryMethod: data.deliveryMethod,
      notes: data.notes,
      items: { create: lineItems },
    },
    include: {
      items: { include: { product: { select: { title: true, sku: true, images: { take: 1, orderBy: { isPrimary: 'desc' } } } } } },
    },
  });
};

export const getUserOrders = async (userId: string, pagination: PaginationOptions) => {
  const [total, orders] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.findMany({
      where: { userId },
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: { select: { title: true, images: { take: 1, orderBy: { isPrimary: 'desc' } } } } } },
        shipment: { select: { courier: true, trackingNumber: true, status: true } },
        invoice: { select: { id: true, invoiceNumber: true, pdfUrl: true } },
      },
    }),
  ]);
  return { orders, total };
};

export const getUserOrderById = async (id: string, userId: string) => {
  const order = await prisma.order.findFirst({
    where: { id, userId },
    include: {
      items: { include: { product: { select: { title: true, sku: true, images: { take: 1, orderBy: { isPrimary: 'desc' } } } } } },
      shipment: true,
      invoice: true,
    },
  });
  if (!order) throw new AppError(ERROR_MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  return order;
};

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
      items: { include: { product: { select: { title: true, sku: true, images: { take: 1, orderBy: { isPrimary: 'desc' } } } } } },
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
