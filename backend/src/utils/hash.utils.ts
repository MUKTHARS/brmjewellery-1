import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (plain: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(plain, hash);
};

export const generateSecureToken = (bytes = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};
