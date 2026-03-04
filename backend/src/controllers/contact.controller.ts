import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.utils';
import { sendSuccess } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import { prisma } from '../config/db.config';
import { getPagination, buildPaginationMeta } from '../utils/pagination.utils';
import { sendEmail } from '../services/email.service';

export const submitContactForm = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body;
  const contact = await prisma.contactMessage.create({ data: { name, email, phone, subject, message } });
  await sendEmail({
    to: email,
    subject: 'Thank you for contacting BRM Jewellery',
    html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px;">
      <h1 style="color:#C9A84C;letter-spacing:4px;">BRM JEWELLERY</h1>
      <hr style="border:none;border-top:1px solid #C9A84C;" />
      <h2 style="color:#1A1A1A;">Thank you, ${name}</h2>
      <p style="color:#6B6B6B;">We have received your message and will be in touch shortly.</p>
    </div>`,
  });
  sendSuccess(res, contact, 'Message sent successfully', HTTP_STATUS.CREATED);
});

export const getContactMessages = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req);
  const where = req.query.isRead !== undefined ? { isRead: req.query.isRead === 'true' } : {};
  const [total, messages] = await Promise.all([
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
    }),
  ]);
  sendSuccess(res, messages, 'Messages retrieved', HTTP_STATUS.OK, buildPaginationMeta(total, pagination.page, pagination.limit));
});

export const markContactRead = asyncHandler(async (req: Request, res: Response) => {
  const msg = await prisma.contactMessage.update({ where: { id: req.params.id }, data: { isRead: true } });
  sendSuccess(res, msg, 'Message marked as read');
});

export const deleteContactMessage = asyncHandler(async (req: Request, res: Response) => {
  await prisma.contactMessage.delete({ where: { id: req.params.id } });
  sendSuccess(res, null, 'Message deleted');
});
