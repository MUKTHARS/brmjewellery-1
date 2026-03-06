import axios from 'axios';
import { prisma } from '../config/db.config';
import { AppError } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import { logger } from '../utils/logger.utils';
import { generateInvoiceForOrder } from './invoice.service';
import { sendEmail, emailTemplates } from './email.service';
import { env } from '../config/env.config';

// Payment methods that require manual collection (order stays UNPAID until staff confirm)
const PENDING_METHODS = new Set(['bank_transfer', 'klarna', 'clearpay']);

// ── Process payment ────────────────────────────────────────────────────────────
//
// For card / Apple Pay:   marks order PAID immediately (staff collect via terminal or this
//                         is used in demo mode). Invoice + confirmation email sent.
//
// For bank transfer /
// Klarna / Clearpay:      marks order UNPAID (PENDING), sends the customer bank details
//                         and instalment schedule by email.  Admin confirms once received.

export const processPayment = async (orderId: string, method: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: { select: { email: true, firstName: true, lastName: true } } },
  });
  if (!order) throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
  if (order.paymentStatus === 'PAID') throw new AppError('Order already paid', HTTP_STATUS.BAD_REQUEST);

  const methodKey = method.toLowerCase().replace(/\s+/g, '_');
  const isPending = PENDING_METHODS.has(methodKey);

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: isPending ? 'UNPAID' : 'PAID',
      fulfillmentStatus: isPending ? 'PENDING' : 'CONFIRMED',
      stripePaymentId: `${methodKey}_${Date.now()}`,
    },
    include: { user: { select: { email: true, firstName: true, lastName: true } } },
  });

  const customerName = `${updated.user.firstName} ${updated.user.lastName}`;
  const totalStr = Number(updated.totalGBP).toFixed(2);

  try {
    if (!isPending) {
      // Confirmed — generate invoice and send confirmation
      const invoice = await generateInvoiceForOrder(orderId);
      await sendEmail({
        to: updated.user.email,
        subject: `Order Confirmed – ${updated.orderNumber}`,
        html: emailTemplates.orderConfirmation(
          updated.orderNumber,
          customerName,
          Number(updated.totalGBP),
        ),
        attachments: [
          { filename: `Invoice-${updated.orderNumber}.pdf`, path: invoice.pdfUrl.replace(/^\//, '') },
        ],
      });
    } else {
      // Pending — send payment instructions
      const instalment = (Number(updated.totalGBP) / (methodKey === 'clearpay' ? 4 : 3)).toFixed(2);
      const isInstalments = methodKey === 'klarna' || methodKey === 'clearpay';
      const instalmentLabel = methodKey === 'klarna' ? 'Klarna Pay in 3' : 'Clearpay Pay in 4';
      const instalmentCount = methodKey === 'clearpay' ? 4 : 3;

      await sendEmail({
        to: updated.user.email,
        subject: `Payment Instructions – ${updated.orderNumber}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
            <h2 style="color:#C9A84C">Thank you, ${updated.user.firstName}!</h2>
            <p>Your order <strong>${updated.orderNumber}</strong> has been placed. To complete your purchase, please transfer payment using the details below.</p>

            ${isInstalments ? `
            <div style="background:#f9f5ec;border-left:3px solid #C9A84C;padding:12px 16px;margin:16px 0">
              <strong>${instalmentLabel}</strong> — ${instalmentCount} interest-free payments of
              <strong>£${instalment}</strong>
            </div>
            <p>Please transfer the <strong>first payment of £${instalment}</strong> now. We will contact you for subsequent payments.</p>
            ` : ''}

            <table style="border-collapse:collapse;width:100%;margin:16px 0">
              <tr style="background:#f9f5ec">
                <td style="padding:10px 12px;font-weight:600">Account Name</td>
                <td style="padding:10px 12px">${env.BANK_ACCOUNT_NAME}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;font-weight:600">Sort Code</td>
                <td style="padding:10px 12px">${env.BANK_SORT_CODE}</td>
              </tr>
              <tr style="background:#f9f5ec">
                <td style="padding:10px 12px;font-weight:600">Account Number</td>
                <td style="padding:10px 12px">${env.BANK_ACCOUNT_NUMBER}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;font-weight:600">Reference</td>
                <td style="padding:10px 12px"><strong>${updated.orderNumber}</strong></td>
              </tr>
              <tr style="background:#f9f5ec">
                <td style="padding:10px 12px;font-weight:600">${isInstalments ? 'First Payment' : 'Amount'}</td>
                <td style="padding:10px 12px"><strong>£${isInstalments ? instalment : totalStr}</strong></td>
              </tr>
            </table>

            <p style="color:#666;font-size:13px">Your order will be confirmed and dispatched once payment is received. If you have any questions please reply to this email or call us.</p>
          </div>
        `,
      });
    }
  } catch (e) {
    logger.error(`Email/invoice failed for order ${orderId}: ${(e as Error).message}`);
  }

  return {
    orderId,
    orderNumber: updated.orderNumber,
    status: updated.paymentStatus,
    pending: isPending,
    bankDetails: isPending
      ? {
          accountName: env.BANK_ACCOUNT_NAME,
          sortCode: env.BANK_SORT_CODE,
          accountNumber: env.BANK_ACCOUNT_NUMBER,
          reference: updated.orderNumber,
        }
      : undefined,
  };
};

// ── PayPal ─────────────────────────────────────────────────────────────────────

const getPayPalToken = async (): Promise<string> => {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET)
    throw new AppError('PayPal is not configured', HTTP_STATUS.SERVICE_UNAVAILABLE);
  const auth = Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const { data } = await axios.post(
    `${env.PAYPAL_BASE_URL}/v1/oauth2/token`,
    'grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' } },
  );
  return data.access_token as string;
};

export const createPayPalOrder = async (orderId: string) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);

  const token = await getPayPalToken();
  const { data } = await axios.post(
    `${env.PAYPAL_BASE_URL}/v2/checkout/orders`,
    {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: order.orderNumber,
        amount: { currency_code: 'GBP', value: Number(order.totalGBP).toFixed(2) },
        description: `BRM Jewellery – ${order.orderNumber}`,
      }],
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' } },
  );

  await prisma.order.update({ where: { id: orderId }, data: { paypalOrderId: data.id } });
  return { paypalOrderId: data.id as string };
};

export const capturePayPalOrder = async (paypalOrderId: string) => {
  const order = await prisma.order.findFirst({
    where: { paypalOrderId },
    include: { user: { select: { email: true, firstName: true, lastName: true } } },
  });
  if (!order) throw new AppError('Order not found for this PayPal order', HTTP_STATUS.NOT_FOUND);
  if (order.paymentStatus === 'PAID') throw new AppError('Order already paid', HTTP_STATUS.BAD_REQUEST);

  const token = await getPayPalToken();
  await axios.post(
    `${env.PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
    {},
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } },
  );

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: 'PAID', fulfillmentStatus: 'CONFIRMED', stripePaymentId: `paypal_${paypalOrderId}` },
  });

  const customerName = `${order.user.firstName} ${order.user.lastName}`;
  try {
    const invoice = await generateInvoiceForOrder(order.id);
    await sendEmail({
      to: order.user.email,
      subject: `Order Confirmed – ${order.orderNumber}`,
      html: emailTemplates.orderConfirmation(order.orderNumber, customerName, Number(order.totalGBP)),
      attachments: [{ filename: `Invoice-${order.orderNumber}.pdf`, path: invoice.pdfUrl.replace(/^\//, '') }],
    });
  } catch (e) { logger.error(`Email failed for PayPal order ${order.id}: ${(e as Error).message}`); }

  return { orderId: order.id, orderNumber: order.orderNumber, status: 'PAID' };
};

// ── Klarna ─────────────────────────────────────────────────────────────────────

export const createKlarnaSession = async (orderId: string) => {
  if (!env.KLARNA_API_KEY)
    throw new AppError('Klarna is not configured', HTTP_STATUS.SERVICE_UNAVAILABLE);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: { select: { email: true, firstName: true, lastName: true } } },
  });
  if (!order) throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);

  const totalMinor = Math.round(Number(order.totalGBP) * 100);
  const vatMinor = Math.round(Number(order.vatGBP) * 100);

  const { data } = await axios.post(
    `${env.KLARNA_BASE_URL}/payments/v1/sessions`,
    {
      purchase_country: 'GB',
      purchase_currency: 'GBP',
      locale: 'en-GB',
      order_amount: totalMinor,
      order_tax_amount: vatMinor,
      order_lines: order.items.map((item) => ({
        type: 'physical',
        name: item.productTitle,
        quantity: item.quantity,
        unit_price: Math.round(Number(item.priceAtPurchaseGBP) * 100),
        total_amount: Math.round(Number(item.priceAtPurchaseGBP) * item.quantity * 100),
        total_tax_amount: 0,
      })),
      billing_address: {
        email: order.user.email,
        given_name: order.user.firstName,
        family_name: order.user.lastName,
      },
    },
    { headers: { Authorization: `Basic ${env.KLARNA_API_KEY}`, 'Content-Type': 'application/json' } },
  );

  return { sessionId: data.session_id as string, clientToken: data.client_token as string };
};

export const authorizeKlarna = async (orderId: string, authorizationToken: string) => {
  if (!env.KLARNA_API_KEY)
    throw new AppError('Klarna is not configured', HTTP_STATUS.SERVICE_UNAVAILABLE);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: { select: { email: true, firstName: true, lastName: true } } },
  });
  if (!order) throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
  if (order.paymentStatus === 'PAID') throw new AppError('Order already paid', HTTP_STATUS.BAD_REQUEST);

  const totalMinor = Math.round(Number(order.totalGBP) * 100);
  const vatMinor = Math.round(Number(order.vatGBP) * 100);

  const { data } = await axios.post(
    `${env.KLARNA_BASE_URL}/payments/v1/authorizations/${authorizationToken}/order`,
    {
      purchase_country: 'GB',
      purchase_currency: 'GBP',
      locale: 'en-GB',
      order_amount: totalMinor,
      order_tax_amount: vatMinor,
      order_lines: order.items.map((item) => ({
        type: 'physical',
        name: item.productTitle,
        quantity: item.quantity,
        unit_price: Math.round(Number(item.priceAtPurchaseGBP) * 100),
        total_amount: Math.round(Number(item.priceAtPurchaseGBP) * item.quantity * 100),
        total_tax_amount: 0,
      })),
      merchant_reference1: order.orderNumber,
    },
    { headers: { Authorization: `Basic ${env.KLARNA_API_KEY}`, 'Content-Type': 'application/json' } },
  );

  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: 'PAID', fulfillmentStatus: 'CONFIRMED', stripePaymentId: `klarna_${data.order_id}` },
  });

  const customerName = `${order.user.firstName} ${order.user.lastName}`;
  try {
    const invoice = await generateInvoiceForOrder(orderId);
    await sendEmail({
      to: order.user.email,
      subject: `Order Confirmed – ${order.orderNumber}`,
      html: emailTemplates.orderConfirmation(order.orderNumber, customerName, Number(order.totalGBP)),
      attachments: [{ filename: `Invoice-${order.orderNumber}.pdf`, path: invoice.pdfUrl.replace(/^\//, '') }],
    });
  } catch (e) { logger.error(`Email failed for Klarna order ${orderId}: ${(e as Error).message}`); }

  return { orderId, orderNumber: order.orderNumber, status: 'PAID' };
};

// ── Clearpay / Afterpay ────────────────────────────────────────────────────────

const getClearpayAuth = () => {
  if (!env.CLEARPAY_MERCHANT_ID || !env.CLEARPAY_SECRET_KEY)
    throw new AppError('Clearpay is not configured', HTTP_STATUS.SERVICE_UNAVAILABLE);
  return `Basic ${Buffer.from(`${env.CLEARPAY_MERCHANT_ID}:${env.CLEARPAY_SECRET_KEY}`).toString('base64')}`;
};

export const createClearpayCheckout = async (orderId: string) => {
  const auth = getClearpayAuth();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: { select: { email: true, firstName: true, lastName: true } } },
  });
  if (!order) throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);

  const shippingAddress = order.shippingAddress as Record<string, string>;

  const { data } = await axios.post(
    `${env.CLEARPAY_BASE_URL}/v2/checkouts`,
    {
      amount: { amount: Number(order.totalGBP).toFixed(2), currency: 'GBP' },
      consumer: { email: order.user.email, givenNames: order.user.firstName, surname: order.user.lastName },
      billing: {
        name: `${order.user.firstName} ${order.user.lastName}`,
        line1: shippingAddress.line1 || '',
        area1: shippingAddress.city || '',
        postcode: shippingAddress.postcode || '',
        countryCode: 'GB',
      },
      shipping: {
        name: `${order.user.firstName} ${order.user.lastName}`,
        line1: shippingAddress.line1 || '',
        area1: shippingAddress.city || '',
        postcode: shippingAddress.postcode || '',
        countryCode: 'GB',
      },
      items: order.items.map((item) => ({
        name: item.productTitle,
        sku: item.productSku,
        quantity: item.quantity,
        price: { amount: Number(item.priceAtPurchaseGBP).toFixed(2), currency: 'GBP' },
      })),
      merchant: {
        redirectConfirmUrl: `${env.FRONTEND_URL}/checkout/clearpay?orderId=${orderId}`,
        redirectCancelUrl: `${env.FRONTEND_URL}/checkout`,
        popupOriginUrl: `${env.FRONTEND_URL}/checkout`,
      },
      merchantReference: order.orderNumber,
    },
    { headers: { Authorization: auth, 'Content-Type': 'application/json', 'Accept': 'application/json' } },
  );

  return { token: data.token as string, redirectCheckoutUrl: data.redirectCheckoutUrl as string };
};

export const confirmClearpay = async (orderId: string, orderToken: string, status: string) => {
  if (status !== 'SUCCESS') throw new AppError('Clearpay payment was not approved', HTTP_STATUS.BAD_REQUEST);
  const auth = getClearpayAuth();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: { select: { email: true, firstName: true, lastName: true } } },
  });
  if (!order) throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
  if (order.paymentStatus === 'PAID') throw new AppError('Order already paid', HTTP_STATUS.BAD_REQUEST);

  const { data } = await axios.post(
    `${env.CLEARPAY_BASE_URL}/v2/payments/capture`,
    { token: orderToken, merchantReference: order.orderNumber },
    { headers: { Authorization: auth, 'Content-Type': 'application/json', 'Accept': 'application/json' } },
  );

  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: 'PAID', fulfillmentStatus: 'CONFIRMED', stripePaymentId: `clearpay_${data.id}` },
  });

  const customerName = `${order.user.firstName} ${order.user.lastName}`;
  try {
    const invoice = await generateInvoiceForOrder(orderId);
    await sendEmail({
      to: order.user.email,
      subject: `Order Confirmed – ${order.orderNumber}`,
      html: emailTemplates.orderConfirmation(order.orderNumber, customerName, Number(order.totalGBP)),
      attachments: [{ filename: `Invoice-${order.orderNumber}.pdf`, path: invoice.pdfUrl.replace(/^\//, '') }],
    });
  } catch (e) { logger.error(`Email failed for Clearpay order ${orderId}: ${(e as Error).message}`); }

  return { orderId, orderNumber: order.orderNumber, status: 'PAID' };
};

// ── Refund ─────────────────────────────────────────────────────────────────────
// Updates DB status. For card payments staff process the refund via their terminal.

export const refundOrder = async (orderId: string) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);

  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: 'REFUNDED', fulfillmentStatus: 'REFUNDED' },
  });

  return { refunded: true, orderNumber: order.orderNumber };
};
