import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.utils';
import { sendSuccess } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import { getPagination, buildPaginationMeta } from '../utils/pagination.utils';
import * as orderService from '../services/order.service';

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.createOrder(req.user!.id, req.body);
  sendSuccess(res, order, 'Order created', HTTP_STATUS.CREATED);
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req);
  const { orders, total } = await orderService.getUserOrders(req.user!.id, pagination);
  sendSuccess(res, orders, 'Orders retrieved', HTTP_STATUS.OK, buildPaginationMeta(total, pagination.page, pagination.limit));
});

export const getMyOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getUserOrderById(req.params.id, req.user!.id);
  sendSuccess(res, order, 'Order retrieved');
});

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req);
  const { orders, total } = await orderService.getOrders(pagination, {
    status: req.query.status as string,
    paymentStatus: req.query.paymentStatus as string,
    userId: req.query.userId as string,
    search: req.query.search as string,
    from: req.query.from as string,
    to: req.query.to as string,
    sortBy: req.query.sortBy as string,
    order: req.query.order as string,
  });
  sendSuccess(res, orders, 'Orders retrieved', HTTP_STATUS.OK, buildPaginationMeta(total, pagination.page, pagination.limit));
});

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(req.params.id);
  sendSuccess(res, order, 'Order retrieved');
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body);
  sendSuccess(res, order, 'Order updated');
});
