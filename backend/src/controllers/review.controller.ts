import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.utils';
import { sendSuccess } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import { getPagination, buildPaginationMeta } from '../utils/pagination.utils';
import * as reviewService from '../services/review.service';

export const getReviews = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req);
  const { reviews, total } = await reviewService.getReviews(pagination, {
    productId: req.query.productId as string,
    productSlug: req.query.productSlug as string,
    rating: req.query.rating as string,
    isVisible: req.query.isVisible as string,
  });
  sendSuccess(res, reviews, 'Reviews retrieved', HTTP_STATUS.OK, buildPaginationMeta(total, pagination.page, pagination.limit));
});

export const toggleVisibility = asyncHandler(async (req: Request, res: Response) => {
  const { isVisible } = req.body;
  const review = await reviewService.toggleReviewVisibility(req.params.id, isVisible);
  sendSuccess(res, review, 'Review updated');
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  await reviewService.deleteReview(req.params.id);
  sendSuccess(res, null, 'Review deleted');
});
