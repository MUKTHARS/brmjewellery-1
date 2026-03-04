import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.utils';
import { sendSuccess } from '../utils/apiResponse.utils';
import * as newsletterService from '../services/newsletter.service';

export const subscribe = asyncHandler(async (req: Request, res: Response) => {
  const sub = await newsletterService.subscribe(req.body.email);
  sendSuccess(res, sub, 'Subscribed successfully');
});

export const unsubscribe = asyncHandler(async (req: Request, res: Response) => {
  await newsletterService.unsubscribe(req.body.email);
  sendSuccess(res, null, 'Unsubscribed successfully');
});

export const getSubscribers = asyncHandler(async (_req: Request, res: Response) => {
  const subscribers = await newsletterService.getSubscribers();
  sendSuccess(res, subscribers, 'Subscribers retrieved');
});
