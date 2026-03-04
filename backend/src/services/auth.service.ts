import { prisma } from '../config/db.config';
import { hashPassword, comparePassword, generateSecureToken } from '../utils/hash.utils';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  REFRESH_TOKEN_EXPIRY_DAYS,
} from '../utils/jwt.utils';
import { addDays } from '../utils/dateTime.utils';
import { AppError } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import { ERROR_MESSAGES } from '../constants/errorMessages.constants';
import { sendEmail, emailTemplates } from './email.service';
import { env } from '../config/env.config';
import type { RegisterInput, LoginInput } from '../validators/auth.validator';

export const registerUser = async (data: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);

  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    },
    select: { id: true, email: true, role: true, firstName: true, lastName: true },
  });

  await sendEmail({
    to: user.email,
    subject: 'Welcome to BRM Jewellery',
    html: emailTemplates.welcomeEmail(user.firstName),
  });

  return user;
};

export const loginUser = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
  if (!user.isActive) throw new AppError(ERROR_MESSAGES.ACCOUNT_DISABLED, HTTP_STATUS.FORBIDDEN);

  const valid = await comparePassword(data.password, user.passwordHash);
  if (!valid) throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });

  const tokenId = generateSecureToken(16);
  const refreshTokenStr = generateRefreshToken({ userId: user.id, tokenId });

  await prisma.refreshToken.create({
    data: {
      token: refreshTokenStr,
      userId: user.id,
      expiresAt: addDays(new Date(), REFRESH_TOKEN_EXPIRY_DAYS),
    },
  });

  return {
    accessToken,
    refreshToken: refreshTokenStr,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  };
};

export const refreshAccessToken = async (refreshTokenStr: string) => {
  const payload = verifyRefreshToken(refreshTokenStr);
  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshTokenStr } });

  if (!stored || stored.expiresAt < new Date()) {
    if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } });
    throw new AppError(ERROR_MESSAGES.TOKEN_EXPIRED, HTTP_STATUS.UNAUTHORIZED);
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);

  const newAccessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
  return { accessToken: newAccessToken };
};

export const logoutUser = async (refreshTokenStr: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({ where: { token: refreshTokenStr } });
};

export const forgotPassword = async (email: string): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return; // silently fail to prevent enumeration

  await prisma.passwordReset.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  const token = generateSecureToken();
  await prisma.passwordReset.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Reset your BRM Jewellery password',
    html: emailTemplates.passwordReset(user.firstName, resetUrl),
  });
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  const resetRecord = await prisma.passwordReset.findUnique({ where: { token } });

  if (!resetRecord || resetRecord.used || resetRecord.expiresAt < new Date()) {
    throw new AppError(ERROR_MESSAGES.RESET_TOKEN_INVALID, HTTP_STATUS.BAD_REQUEST);
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: resetRecord.userId }, data: { passwordHash } });
  await prisma.passwordReset.update({ where: { id: resetRecord.id }, data: { used: true } });
  // Revoke all refresh tokens
  await prisma.refreshToken.deleteMany({ where: { userId: resetRecord.userId } });
};
