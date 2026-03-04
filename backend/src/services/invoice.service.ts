import path from 'path';
import { prisma } from '../config/db.config';
import { AppError } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import { generateInvoicePdf } from '../utils/invoicePdf.utils';
import { env } from '../config/env.config';

const nextInvoiceNumber = async (): Promise<string> => {
  const count = await prisma.invoice.count();
  const num = String(count + 1).padStart(5, '0');
  return `BRM-${new Date().getFullYear()}-${num}`;
};

export const generateInvoiceForOrder = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      items: { include: { product: { select: { title: true, sku: true } } } },
    },
  });
  if (!order) throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);

  const existing = await prisma.invoice.findUnique({ where: { orderId } });
  if (existing) return existing;

  const invoiceNumber = await nextInvoiceNumber();
  const filename = `${invoiceNumber}.pdf`;
  const outputPath = path.resolve(env.UPLOAD_DIR, 'invoices', filename);

  const addr = order.shippingAddress as Record<string, string>;

  await generateInvoicePdf(
    {
      invoiceNumber,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      customerName: `${order.user.firstName} ${order.user.lastName}`,
      customerEmail: order.user.email,
      shippingAddress: {
        line1: addr.line1,
        line2: addr.line2,
        city: addr.city,
        county: addr.county,
        postcode: addr.postcode,
        country: addr.country ?? 'GB',
      },
      items: order.items.map((i) => ({
        title: i.productTitle,
        sku: i.productSku,
        quantity: i.quantity,
        unitPrice: Number(i.priceAtPurchaseGBP),
        total: Number(i.priceAtPurchaseGBP) * i.quantity,
        metalType: i.metalType ?? undefined,
        carat: i.carat ?? undefined,
      })),
      subtotalGBP: Number(order.subtotalGBP),
      vatGBP: Number(order.vatGBP),
      shippingCostGBP: Number(order.shippingCostGBP),
      totalGBP: Number(order.totalGBP),
    },
    outputPath
  );

  const pdfUrl = `/uploads/invoices/${filename}`;
  const invoice = await prisma.invoice.create({
    data: { orderId, invoiceNumber, pdfUrl, sentAt: new Date() },
  });

  return invoice;
};

export const getInvoiceByOrder = async (orderId: string) => {
  return prisma.invoice.findUnique({ where: { orderId } });
};
