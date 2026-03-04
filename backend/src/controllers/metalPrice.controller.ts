import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.utils';
import { sendSuccess } from '../utils/apiResponse.utils';
import * as metalPriceService from '../services/metalPrice.service';

export const getCurrentPrices = asyncHandler(async (_req: Request, res: Response) => {
  const prices = await metalPriceService.getMetalPrices();
  sendSuccess(res, prices, 'Metal prices retrieved');
});

export const refreshPrices = asyncHandler(async (_req: Request, res: Response) => {
  await metalPriceService.fetchAndCacheMetalPrices();
  const prices = await metalPriceService.getMetalPrices();
  sendSuccess(res, prices, 'Metal prices refreshed');
});
