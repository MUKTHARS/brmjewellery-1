export const BESPOKE_STATUS = {
  NEW: 'NEW',
  IN_REVIEW: 'IN_REVIEW',
  QUOTED: 'QUOTED',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
} as const;

export type BespokeStatusType = (typeof BESPOKE_STATUS)[keyof typeof BESPOKE_STATUS];
