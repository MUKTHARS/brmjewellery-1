import { prisma } from '../config/db.config';
import { AppError } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import { ERROR_MESSAGES } from '../constants/errorMessages.constants';
import { PaginationOptions } from '../utils/pagination.utils';
import { sendEmail, emailTemplates } from './email.service';
import type { CreateBespokeEnquiryInput, UpdateBespokeStatusInput } from '../validators/bespoke.validator';

export const createBespokeEnquiry = async (
  data: CreateBespokeEnquiryInput,
  imageUrls: string[] = [],
  userId?: string
) => {
  const enquiry = await prisma.bespokeEnquiry.create({
    data: {
      userId: userId || null,
      name: data.name,
      email: data.email,
      phone: data.phone,
      metalType: data.metalType,
      carat: data.carat,
      description: data.description,
      budgetGBP: data.budgetGBP,
      referenceImages: imageUrls,
      preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
    },
  });

  await sendEmail({
    to: data.email,
    subject: 'Your Bespoke Jewellery Enquiry – BRM Jewellery',
    html: emailTemplates.bespokeEnquiryConfirmation(data.name),
  });

  return enquiry;
};

export const getBespokeEnquiries = async (
  pagination: PaginationOptions,
  filters: { status?: string; search?: string }
) => {
  const where: Record<string, unknown> = {};
  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [total, enquiries] = await Promise.all([
    prisma.bespokeEnquiry.count({ where }),
    prisma.bespokeEnquiry.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    }),
  ]);

  return { enquiries, total };
};

export const getBespokeEnquiryById = async (id: string) => {
  const enquiry = await prisma.bespokeEnquiry.findUnique({
    where: { id },
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
  });
  if (!enquiry) throw new AppError(ERROR_MESSAGES.ENQUIRY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  return enquiry;
};

export const updateBespokeStatus = async (id: string, data: UpdateBespokeStatusInput) => {
  const enquiry = await prisma.bespokeEnquiry.findUnique({ where: { id } });
  if (!enquiry) throw new AppError(ERROR_MESSAGES.ENQUIRY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  return prisma.bespokeEnquiry.update({
    where: { id },
    data: {
      status: data.status as any,
      ...(data.adminNotes !== undefined && { adminNotes: data.adminNotes }),
      ...(data.quotedPriceGBP !== undefined && { quotedPriceGBP: data.quotedPriceGBP }),
    },
  });
};
