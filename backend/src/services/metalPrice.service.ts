import axios from 'axios';
import { prisma } from '../config/db.config';
import { METALS_API_CONFIG, TROY_OZ_TO_GRAMS, PURITY_MULTIPLIERS } from '../config/metalPrice.config';
import { logger } from '../utils/logger.utils';

export const fetchAndCacheMetalPrices = async (): Promise<void> => {
  try {
    if (!METALS_API_CONFIG.apiKey) {
      logger.warn('METALS_API_KEY not set — using mock prices');
      await storeMockPrices();
      return;
    }

    const { data } = await axios.get(`${METALS_API_CONFIG.baseUrl}/latest`, {
      params: { access_key: METALS_API_CONFIG.apiKey, base: 'GBP', symbols: 'XAU,XAG,XPT' },
    });

    if (!data.success) throw new Error('Metals API returned failure');

    const gbpPerTroyOz = {
      gold: 1 / data.rates.XAU,
      silver: 1 / data.rates.XAG,
      platinum: 1 / data.rates.XPT,
    };

    const pricesPerGram = {
      gold: gbpPerTroyOz.gold / TROY_OZ_TO_GRAMS,
      silver: gbpPerTroyOz.silver / TROY_OZ_TO_GRAMS,
      platinum: gbpPerTroyOz.platinum / TROY_OZ_TO_GRAMS,
    };

    // Build per-carat prices
    const rows: Array<{ metal: string; carat: string | null; pricePerGramGBP: number }> = [
      { metal: 'SILVER', carat: '925', pricePerGramGBP: pricesPerGram.silver * PURITY_MULTIPLIERS['925'] },
      { metal: 'PLATINUM', carat: '950', pricePerGramGBP: pricesPerGram.platinum * PURITY_MULTIPLIERS['950'] },
    ];

    for (const [carat, multiplier] of Object.entries(PURITY_MULTIPLIERS)) {
      if (['9k', '14k', '18k', '22k', '24k'].includes(carat)) {
        rows.push({ metal: 'GOLD', carat, pricePerGramGBP: pricesPerGram.gold * multiplier });
      }
    }

    // Upsert in DB
    for (const row of rows) {
      await prisma.metalPriceCache.upsert({
        where: { metal_carat: { metal: row.metal, carat: row.carat } },
        create: { metal: row.metal, carat: row.carat, pricePerGramGBP: row.pricePerGramGBP, fetchedAt: new Date() },
        update: { pricePerGramGBP: row.pricePerGramGBP, fetchedAt: new Date() },
      });
    }

    logger.info('Metal prices updated and saved to DB');
  } catch (error) {
    logger.error(`Failed to fetch metal prices: ${(error as Error).message}`);
  }
};

const storeMockPrices = async (): Promise<void> => {
  const mockRows = [
    { metal: 'GOLD', carat: '9k', pricePerGramGBP: 22.5 },
    { metal: 'GOLD', carat: '14k', pricePerGramGBP: 35.1 },
    { metal: 'GOLD', carat: '18k', pricePerGramGBP: 45.0 },
    { metal: 'GOLD', carat: '22k', pricePerGramGBP: 54.96 },
    { metal: 'GOLD', carat: '24k', pricePerGramGBP: 59.94 },
    { metal: 'SILVER', carat: '925', pricePerGramGBP: 0.74 },
    { metal: 'PLATINUM', carat: '950', pricePerGramGBP: 28.5 },
  ];
  for (const row of mockRows) {
    await prisma.metalPriceCache.upsert({
      where: { metal_carat: { metal: row.metal, carat: row.carat } },
      create: { metal: row.metal, carat: row.carat, pricePerGramGBP: row.pricePerGramGBP, fetchedAt: new Date() },
      update: { pricePerGramGBP: row.pricePerGramGBP, fetchedAt: new Date() },
    });
  }
};

export const getMetalPrices = async () => {
  const rows = await prisma.metalPriceCache.findMany({ orderBy: [{ metal: 'asc' }, { carat: 'asc' }] });
  return { rows, fetchedAt: rows[0]?.fetchedAt ?? new Date() };
};
