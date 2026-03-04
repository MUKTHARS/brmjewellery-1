const formatter = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });

export const formatGBP = (amount: number): string => formatter.format(amount);

export const formatGBPIncVat = (amount: number): string => `${formatter.format(amount)} inc. VAT`;

export const formatPercent = (value: number): string => `${value.toFixed(1)}%`;
