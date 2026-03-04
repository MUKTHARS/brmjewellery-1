import { prisma } from '../config/db.config';
import { AppError } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import { PaginationOptions } from '../utils/pagination.utils';

export const getReviews = async (
  pagination: PaginationOptions,
  filters: { productId?: string; rating?: string; isVisible?: string }
) => {
  const where: Record<string, unknown> = {};
  if (filters.productId) where.productId = filters.productId;
  if (filters.rating) where.rating = parseInt(filters.rating);
  if (filters.isVisible !== undefined) where.isVisible = filters.isVisible === 'true';

  const [total, reviews] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, title: true, slug: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    }),
  ]);

  return { reviews, total };
};

export const toggleReviewVisibility = async (id: string, isVisible: boolean) => {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw new AppError('Review not found', HTTP_STATUS.NOT_FOUND);
  return prisma.review.update({ where: { id }, data: { isVisible } });
};

export const deleteReview = async (id: string): Promise<void> => {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw new AppError('Review not found', HTTP_STATUS.NOT_FOUND);
  await prisma.review.delete({ where: { id } });
};
