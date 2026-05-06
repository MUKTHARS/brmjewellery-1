import axios from 'axios';
import { prisma } from '../config/db.config';
import { TROY_OZ_TO_GRAMS, PURITY_MULTIPLIERS } from '../config/metalPrice.config';
import { logger } from '../utils/logger.utils';

// Reads live prices from BRM Metals backend (same server) so we share one external API call
const BRM_METALS_PRICE_URL = 'http://localhost:3001/api/v1/pricing/current';

export const fetchAndCacheMetalPrices = async (): Promise<void> => {
  try {
    const { data } = await axios.get(BRM_METALS_PRICE_URL, { timeout: 10000 });
    const prices: Array<{ metalType: string; currentPrice: number }> = data?.data?.prices ?? [];

    const find = (metal: string) =>
      prices.find((p) => p.metalType.toUpperCase() === metal.toUpperCase())?.currentPrice;

    const goldOz     = find('GOLD');
    const silverOz   = find('SILVER');
    const platinumOz = find('PLATINUM');

    if (!goldOz || !silverOz || !platinumOz) {
      logger.warn('[metalPriceSync] BRM Metals prices missing — skipping update');
      return;
    }

    const pricesPerGram = {
      gold:     goldOz     / TROY_OZ_TO_GRAMS,
      silver:   silverOz   / TROY_OZ_TO_GRAMS,
      platinum: platinumOz / TROY_OZ_TO_GRAMS,
    };

    const rows: Array<{ metal: string; carat: string; pricePerGramGBP: number }> = [
      { metal: 'SILVER',   carat: '925', pricePerGramGBP: pricesPerGram.silver   * PURITY_MULTIPLIERS['925'] },
      { metal: 'PLATINUM', carat: '950', pricePerGramGBP: pricesPerGram.platinum * PURITY_MULTIPLIERS['950'] },
    ];

    for (const [carat, multiplier] of Object.entries(PURITY_MULTIPLIERS)) {
      if (['9k', '14k', '18k', '22k', '24k'].includes(carat)) {
        rows.push({ metal: 'GOLD', carat, pricePerGramGBP: pricesPerGram.gold * multiplier });
      }
    }

    for (const row of rows) {
      await prisma.metalPriceCache.upsert({
        where:  { metal_carat: { metal: row.metal, carat: row.carat } },
        create: { metal: row.metal, carat: row.carat, pricePerGramGBP: row.pricePerGramGBP, fetchedAt: new Date() },
        update: { pricePerGramGBP: row.pricePerGramGBP, fetchedAt: new Date() },
      });
    }

    logger.info('[metalPriceSync] Prices synced from BRM Metals backend');
  } catch (error) {
    logger.error(`[metalPriceSync] Failed to sync from BRM Metals: ${(error as Error).message}`);
  }
};

export const getMetalPrices = async () => {
  const rows = await prisma.metalPriceCache.findMany({ orderBy: [{ metal: 'asc' }, { carat: 'asc' }] });
  return { rows, fetchedAt: rows[0]?.fetchedAt ?? new Date() };
};
