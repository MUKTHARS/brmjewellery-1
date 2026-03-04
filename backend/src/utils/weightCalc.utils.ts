import { METAL_DENSITY_G_CM3 } from '../config/metalPrice.config';
import { UK_RING_SIZES } from './ringSize.utils';

const BAND_WIDTH_DEFAULT_MM = 3;

export const estimateRingWeight = (
  ukSize: string,
  metalKey: string,
  bandWidthMm = BAND_WIDTH_DEFAULT_MM
): number | null => {
  const innerDiameterMm = UK_RING_SIZES[ukSize];
  const density = METAL_DENSITY_G_CM3[metalKey];
  if (!innerDiameterMm || !density) return null;

  const thicknessMm = 1.5;
  const innerRadiusMm = innerDiameterMm / 2;
  const outerRadiusMm = innerRadiusMm + thicknessMm;

  // Volume = π * (R² - r²) * width
  const volumeCm3 =
    Math.PI *
    ((outerRadiusMm / 10) ** 2 - (innerRadiusMm / 10) ** 2) *
    (bandWidthMm / 10);

  const weightGrams = volumeCm3 * density;
  return parseFloat(weightGrams.toFixed(3));
};

export const buildMetalKey = (metalType: string, carat: string): string => {
  const metalMap: Record<string, string> = {
    GOLD: `GOLD_${carat.toUpperCase()}`,
    SILVER: 'SILVER_925',
    PLATINUM: 'PLATINUM_950',
  };
  return metalMap[metalType.toUpperCase()] ?? '';
};
