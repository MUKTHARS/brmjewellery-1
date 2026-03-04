export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPERADMIN: 'SUPERADMIN',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];
