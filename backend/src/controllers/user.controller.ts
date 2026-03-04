import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.utils';
import { sendSuccess } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import { getPagination, buildPaginationMeta } from '../utils/pagination.utils';
import * as userService from '../services/user.service';

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req);
  const { users, total } = await userService.getUsers(pagination, {
    search: req.query.search as string,
    role: req.query.role as string,
    isActive: req.query.isActive as string,
  });
  sendSuccess(res, users, 'Users retrieved', HTTP_STATUS.OK, buildPaginationMeta(total, pagination.page, pagination.limit));
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id);
  sendSuccess(res, user, 'User retrieved');
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateUser(req.params.id, req.body);
  sendSuccess(res, user, 'User updated');
});

export const getUserOrders = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req);
  const { orders, total } = await userService.getUserOrderHistory(req.params.id, pagination);
  sendSuccess(res, orders, 'Orders retrieved', HTTP_STATUS.OK, buildPaginationMeta(total, pagination.page, pagination.limit));
});
