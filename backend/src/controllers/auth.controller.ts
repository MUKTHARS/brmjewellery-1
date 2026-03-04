import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.utils';
import { sendSuccess, sendError } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import * as authService from '../services/auth.service';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.registerUser(req.body);
  sendSuccess(res, user, 'Account created successfully', HTTP_STATUS.CREATED);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);
  res
    .cookie('accessToken', result.accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 })
    .cookie('refreshToken', result.refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });
  sendSuccess(res, { user: result.user, accessToken: result.accessToken }, 'Login successful');
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (token) await authService.logoutUser(token);
  res.clearCookie('accessToken', COOKIE_OPTS).clearCookie('refreshToken', COOKIE_OPTS);
  sendSuccess(res, null, 'Logged out successfully');
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) {
    sendError(res, 'Refresh token required', HTTP_STATUS.UNAUTHORIZED);
    return;
  }
  const result = await authService.refreshAccessToken(token);
  res.cookie('accessToken', result.accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
  sendSuccess(res, result, 'Token refreshed');
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email);
  sendSuccess(res, null, 'If an account exists with that email, a reset link has been sent');
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);
  sendSuccess(res, null, 'Password reset successfully');
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, req.user, 'Profile retrieved');
});
