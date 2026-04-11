import axios from 'axios';
import { prisma } from '../config/db.config';
import { AppError } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import { env } from '../config/env.config';
import { logger } from '../utils/logger.utils';
import { generateInvoiceForOrder } from './invoice.service';
import { sendEmail, emailTemplates } from './email.service';

const PAYPAL_BASE =
  env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

const getAccessToken = async (): Promise<string> => {
  const res = await axios.post(
    `${PAYPAL_BASE}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      auth: { username: env.PAYPAL_CLIENT_ID ?? '', password: env.PAYPAL_CLIENT_SECRET ?? '' },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  );
  return res.data.access_token as string;
};

export const createPaypalOrder = async (orderId: string) => {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    throw new AppError('PayPal is not configured', HTTP_STATUS.BAD_REQUEST);
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);

  const token = await getAccessToken();

  const res = await axios.post(
    `${PAYPAL_BASE}/v2/checkout/orders`,
    {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: orderId,
          description: `BRM Jewellery Order`,
          amount: {
            currency_code: 'GBP',
            value: Number(order.totalGBP).toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: 'BRM Jewellery',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: `${env.FRONTEND_URL}/checkout/success`,
        cancel_url: `${env.FRONTEND_URL}/checkout`,
      },
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } },
  );

  await prisma.order.update({
    where: { id: orderId },
    data: { paypalOrderId: res.data.id },
  });

  return { paypalOrderId: res.data.id as string };
};

export const capturePaypalOrder = async (paypalOrderId: string) => {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    throw new AppError('PayPal is not configured', HTTP_STATUS.BAD_REQUEST);
  }

  const token = await getAccessToken();

  const res = await axios.post(
    `${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}/capture`,
    {},
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } },
  );

  const referenceId: string = res.data.purchase_units?.[0]?.reference_id;
  if (!referenceId) {
    throw new AppError('No reference ID in PayPal capture response', HTTP_STATUS.BAD_REQUEST);
  }

  const order = await prisma.order.update({
    where: { id: referenceId },
    data: { paymentStatus: 'PAID', fulfillmentStatus: 'CONFIRMED' },
    include: { user: { select: { email: true, firstName: true, lastName: true } } },
  });

  try {
    const invoice = await generateInvoiceForOrder(referenceId);
    await sendEmail({
      to: order.user.email,
      subject: `Order Confirmed – ${order.orderNumber}`,
      html: emailTemplates.orderConfirmation(
        order.orderNumber,
        `${order.user.firstName} ${order.user.lastName}`,
        Number(order.totalGBP),
      ),
      attachments: [{ filename: `Invoice-${order.orderNumber}.pdf`, path: invoice.pdfUrl.replace(/^\//, '') }],
    });
  } catch (e) {
    logger.error(`Invoice/email failed for PayPal order ${paypalOrderId}: ${(e as Error).message}`);
  }

  return { orderId: referenceId, orderNumber: order.orderNumber };
};
