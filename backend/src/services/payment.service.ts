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
