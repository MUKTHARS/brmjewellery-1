import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.utils';
import { sendSuccess } from '../utils/apiResponse.utils';
import * as adminService from '../services/admin.service';

export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await adminService.getDashboardStats();
  sendSuccess(res, stats, 'Dashboard stats retrieved');
});

export const getSalesReport = asyncHandler(async (req: Request, res: Response) => {
  const from = req.query.from ? new Date(req.query.from as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const to = req.query.to ? new Date(req.query.to as string) : new Date();
  const report = await adminService.getSalesReport(from, to);
  sendSuccess(res, report, 'Sales report retrieved');
});

export const getMarginReport = asyncHandler(async (_req: Request, res: Response) => {
  const report = await adminService.getMarginReport();
  sendSuccess(res, report, 'Margin report retrieved');
});

export const getCustomerAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const analytics = await adminService.getCustomerAnalytics();
  sendSuccess(res, analytics, 'Customer analytics retrieved');
});

export const getRevenueByCategory = asyncHandler(async (req: Request, res: Response) => {
  const from = req.query.from ? new Date(req.query.from as string) : new Date(new Date().getFullYear(), 0, 1);
  const to = req.query.to ? new Date(req.query.to as string) : new Date();
  const data = await adminService.getRevenueByCategory(from, to);
  sendSuccess(res, data, 'Revenue by category retrieved');
});
