import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.utils';
import { sendSuccess } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import { getPagination, buildPaginationMeta } from '../utils/pagination.utils';
import { getFileUrl } from '../config/storage.config';
import * as bespokeService from '../services/bespoke.service';

export const submitEnquiry = asyncHandler(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) || [];
  const imageUrls = files.map((f) => getFileUrl('bespoke', f.filename));
  const data = { ...req.body };
  if (data.budgetGBP) data.budgetGBP = parseFloat(data.budgetGBP);
  const enquiry = await bespokeService.createBespokeEnquiry(data, imageUrls, req.user?.id);
  sendSuccess(res, enquiry, 'Enquiry submitted successfully', HTTP_STATUS.CREATED);
});

export const getEnquiries = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req);
  const { enquiries, total } = await bespokeService.getBespokeEnquiries(pagination, {
    status: req.query.status as string,
    search: req.query.search as string,
  });
  sendSuccess(res, enquiries, 'Enquiries retrieved', HTTP_STATUS.OK, buildPaginationMeta(total, pagination.page, pagination.limit));
});

export const getEnquiryById = asyncHandler(async (req: Request, res: Response) => {
  const enquiry = await bespokeService.getBespokeEnquiryById(req.params.id);
  sendSuccess(res, enquiry, 'Enquiry retrieved');
});

export const updateEnquiryStatus = asyncHandler(async (req: Request, res: Response) => {
  const enquiry = await bespokeService.updateBespokeStatus(req.params.id, req.body);
  sendSuccess(res, enquiry, 'Enquiry updated');
});
