export const COURIER_PROVIDERS = {
  ROYAL_MAIL: 'ROYAL_MAIL',
  DHL: 'DHL',
  FEDEX: 'FEDEX',
} as const;

export type CourierProvider = (typeof COURIER_PROVIDERS)[keyof typeof COURIER_PROVIDERS];
