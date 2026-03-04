export interface MetalSpotPrices {
  gold: number;       // price per gram in GBP
  silver: number;     // price per gram in GBP
  platinum: number;   // price per gram in GBP
  fetchedAt: Date;
}

export interface MetalPriceWithCarats {
  metal: string;
  carat: string | null;
  pricePerGramGBP: number;
  fetchedAt: Date;
}

export interface MetalsApiResponse {
  success: boolean;
  timestamp: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}
