import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.utils';
import { sendSuccess } from '../utils/apiResponse.utils';
import * as shippingService from '../services/shipping.service';

export const generateLabel = asyncHandler(async (req: Request, res: Response) => {
  const shipment = await shippingService.generateShippingLabel(req.params.orderId);
  sendSuccess(res, shipment, 'Shipping label generated');
});

export const getTrackingStatus = asyncHandler(async (req: Request, res: Response) => {
  const shipment = await shippingService.getTrackingStatus(req.params.orderId);
  sendSuccess(res, shipment, 'Tracking status retrieved');
});
