import { PURITY_MULTIPLIERS } from '../config/metalPrice.config';

export const calculateProductPrice = (
  baseCost: number,
  weightGrams: number,
  carat: string,
  spotPricePerGram: number
): number => {
  const purity = PURITY_MULTIPLIERS[carat] ?? 0;
  const metalValue = weightGrams * purity * spotPricePerGram;
  return parseFloat((baseCost + metalValue).toFixed(2));
};

export const calculateMetalValue = (
  weightGrams: number,
  carat: string,
  spotPricePerGram: number
): number => {
  const purity = PURITY_MULTIPLIERS[carat] ?? 0;
  return parseFloat((weightGrams * purity * spotPricePerGram).toFixed(2));
};

export const getPurityMultiplier = (carat: string): number => {
  return PURITY_MULTIPLIERS[carat] ?? 0;
};
