import { prisma } from '../config/db.config';
import { logger } from '../utils/logger.utils';
import { AppError } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';

// Shipping label generation is scaffolded — real courier API calls would go here
export const generateShippingLabel = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
  });
  if (!order) throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);

  const existing = await prisma.shipment.findUnique({ where: { orderId } });
  if (existing) return existing;

  // Scaffold: In production, call Royal Mail / DHL / FedEx API here
  const trackingNumber = `BRM${Date.now()}`;
  const courier = order.deliveryMethod.includes('DHL') ? 'DHL'
    : order.deliveryMethod.includes('FEDEX') ? 'FEDEX'
    : 'ROYAL_MAIL';

  const shipment = await prisma.shipment.create({
    data: {
      orderId,
      courier,
      trackingNumber,
      labelUrl: `/uploads/labels/${trackingNumber}.pdf`,
      status: 'LABEL_CREATED',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  logger.info(`Shipping label created for order ${order.orderNumber}: ${trackingNumber}`);
  return shipment;
};

export const getTrackingStatus = async (orderId: string) => {
  const shipment = await prisma.shipment.findUnique({ where: { orderId } });
  if (!shipment) throw new AppError('Shipment not found', HTTP_STATUS.NOT_FOUND);
  return shipment;
};

export const updateShipmentStatus = async (shipmentId: string, status: string): Promise<void> => {
  await prisma.shipment.update({ where: { id: shipmentId }, data: { status } });
};

export const pollAllShipments = async (): Promise<void> => {
  const activeShipments = await prisma.shipment.findMany({
    where: { status: { notIn: ['DELIVERED', 'EXCEPTION'] } },
  });

  for (const shipment of activeShipments) {
    try {
      // Scaffold: call courier tracking API here
      logger.debug(`Polling tracking for ${shipment.trackingNumber}`);
    } catch (e) {
      logger.error(`Tracking poll failed for ${shipment.trackingNumber}: ${(e as Error).message}`);
    }
  }
};
