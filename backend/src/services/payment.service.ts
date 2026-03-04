import { stripe } from '../config/stripe.config';
import { prisma } from '../config/db.config';
import { AppError } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import { logger } from '../utils/logger.utils';
import { generateInvoiceForOrder } from './invoice.service';
import { sendEmail, emailTemplates } from './email.service';
import Stripe from 'stripe';

export const createPaymentIntent = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: { select: { email: true, firstName: true, lastName: true } } },
  });
  if (!order) throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);

  const amountPence = Math.round(Number(order.totalGBP) * 100);

  const intent = await stripe.paymentIntents.create({
    amount: amountPence,
    currency: 'gbp',
    metadata: { orderId, orderNumber: order.orderNumber },
    receipt_email: order.user.email,
    automatic_payment_methods: { enabled: true },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { stripePaymentId: intent.id },
  });

  return { clientSecret: intent.client_secret, paymentIntentId: intent.id };
};

export const handleStripeWebhook = async (rawBody: Buffer, signature: string, webhookSecret: string): Promise<void> => {
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    throw new AppError(`Webhook signature verification failed: ${(err as Error).message}`, HTTP_STATUS.BAD_REQUEST);
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata.orderId;
      if (!orderId) break;

      const order = await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID', fulfillmentStatus: 'CONFIRMED' },
        include: { user: { select: { email: true, firstName: true, lastName: true } } },
      });

      // Generate invoice
      try {
        const invoice = await generateInvoiceForOrder(orderId);
        await sendEmail({
          to: order.user.email,
          subject: `Order Confirmed – ${order.orderNumber}`,
          html: emailTemplates.orderConfirmation(order.orderNumber, `${order.user.firstName} ${order.user.lastName}`, Number(order.totalGBP)),
          attachments: [{ filename: `Invoice-${order.orderNumber}.pdf`, path: invoice.pdfUrl.replace(/^\//, '') }],
        });
      } catch (e) {
        logger.error(`Invoice generation failed for order ${orderId}: ${(e as Error).message}`);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata.orderId;
      if (orderId) {
        await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: 'FAILED' } });
      }
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      const piId = charge.payment_intent as string;
      if (piId) {
        await prisma.order.updateMany({
          where: { stripePaymentId: piId },
          data: { paymentStatus: 'REFUNDED', fulfillmentStatus: 'REFUNDED' },
        });
      }
      break;
    }

    default:
      logger.info(`Unhandled Stripe event: ${event.type}`);
  }
};

export const refundOrder = async (orderId: string, amountPence?: number, reason?: string) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
  if (!order.stripePaymentId) throw new AppError('No payment to refund', HTTP_STATUS.BAD_REQUEST);

  const refund = await stripe.refunds.create({
    payment_intent: order.stripePaymentId,
    ...(amountPence ? { amount: amountPence } : {}),
    reason: (reason as Stripe.RefundCreateParams.Reason) ?? 'requested_by_customer',
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: 'REFUNDED', fulfillmentStatus: 'REFUNDED' },
  });

  return refund;
};
