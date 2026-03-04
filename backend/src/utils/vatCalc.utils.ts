export const VAT_RATE = 0.20; // UK 20%

export const addVat = (netAmount: number): number => {
  return parseFloat((netAmount * (1 + VAT_RATE)).toFixed(2));
};

export const removeVat = (grossAmount: number): number => {
  return parseFloat((grossAmount / (1 + VAT_RATE)).toFixed(2));
};

export const calculateVat = (netAmount: number): number => {
  return parseFloat((netAmount * VAT_RATE).toFixed(2));
};

export const extractVat = (grossAmount: number): number => {
  return parseFloat((grossAmount - grossAmount / (1 + VAT_RATE)).toFixed(2));
};
