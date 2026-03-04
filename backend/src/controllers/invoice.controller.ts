import { Request, Response } from 'express';
import path from 'path';
import { asyncHandler } from '../utils/asyncHandler.utils';
import { sendSuccess, sendError } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import * as invoiceService from '../services/invoice.service';

export const generateInvoice = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await invoiceService.generateInvoiceForOrder(req.params.orderId);
  sendSuccess(res, invoice, 'Invoice generated', HTTP_STATUS.CREATED);
});

export const getInvoiceByOrder = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await invoiceService.getInvoiceByOrder(req.params.orderId);
  if (!invoice) {
    sendError(res, 'Invoice not found', HTTP_STATUS.NOT_FOUND);
    return;
  }
  sendSuccess(res, invoice, 'Invoice retrieved');
});

export const downloadInvoice = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await invoiceService.getInvoiceByOrder(req.params.orderId);
  if (!invoice) {
    sendError(res, 'Invoice not found', HTTP_STATUS.NOT_FOUND);
    return;
  }
  const filePath = path.resolve(invoice.pdfUrl.replace(/^\//, ''));
  res.download(filePath, `Invoice-${invoice.invoiceNumber}.pdf`);
});
