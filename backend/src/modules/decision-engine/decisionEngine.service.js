import prisma from '../../config/prisma.js';
import { findOrCreateCrop } from '../market/market.service.js';
import { calculateBuyerTrustScore, calculateQualityMatch } from './buyerTrustScore.calculator.js';
import { calculateNetRealisation } from './netRealisation.calculator.js';
import { recommendSellTiming } from './sellTiming.recommender.js';

/**
 * Orchestrates the Smart Selling Decision:
 *   1. Fetch nearby markets + open buyer offers for the crop
 *   2. Score each option on net realisation (not headline price)
 *   3. Attach buyer trust + quality match
 *   4. Attach a top-level sell-timing recommendation
 *   5. Persist the query for a future feedback / training loop
 */
export async function evaluateSellDecision(farmerId, input) {
  const crop = await findOrCreateCrop({ cropId: input.cropId, cropName: input.cropName });

  const farmer = farmerId
    ? await prisma.user.findUnique({ where: { id: farmerId } })
    : null;

  const farmerLat = input.latitude ?? farmer?.latitude ?? null;
  const farmerLng = input.longitude ?? farmer?.longitude ?? null;

  const since = new Date();
  since.setDate(since.getDate() - 14);

  const [marketPrices, offers] = await Promise.all([
    prisma.marketPrice.findMany({
      where: { cropId: input.cropId, date: { gte: since } },
      include: { market: true },
      orderBy: { date: 'asc' },
    }),
    prisma.offer.findMany({
      where: {
        cropId: input.cropId,
        status: 'OPEN',
        OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
      },
      include: { buyer: { include: { user: true } } },
    }),
  ]);

  const modalSeries = marketPrices.map((p) => p.modalPrice);
  const timing = recommendSellTiming({
    modalPricesOldestFirst: modalSeries,
    hasStorage: input.hasStorage,
    storageDaysAvailable: input.storageDaysAvailable,
  });

  const delayDays = timing.advice === 'SELL_NOW' ? 0 : timing.waitDays;

  const latestByMarket = new Map();
  for (const row of marketPrices) {
    latestByMarket.set(row.marketId, row);
  }

  const rankedOptions = [];

  for (const latest of latestByMarket.values()) {
    const nr = calculateNetRealisation({
      offerPrice: latest.modalPrice,
      farmerLat,
      farmerLng,
      destLat: latest.market.latitude,
      destLng: latest.market.longitude,
      delayDays,
    });

    rankedOptions.push({
      optionType: 'MARKET',
      buyerOrMarketName: latest.market.name,
      marketId: latest.market.id,
      buyerId: null,
      offerId: null,
      offerPrice: latest.modalPrice,
      transportCost: nr.transportCost,
      storageCost: nr.storageCost,
      distanceKm: nr.distanceKm,
      netRealisation: nr.netRealisation,
      buyerTrustScore: 70,
      qualityMatch: 100,
      district: latest.market.district,
      state: latest.market.state,
      notes: 'APMC modal price (not a firm digital offer). Trust score is a mandi baseline, not a buyer history.',
    });
  }

  for (const offer of offers) {
    const trust = calculateBuyerTrustScore(offer.buyer);
    const qualityMatch = calculateQualityMatch(input.qualityGrade, offer.minGrade);
    const nr = calculateNetRealisation({
      offerPrice: offer.offerPrice,
      farmerLat,
      farmerLng,
      destLat: offer.latitude ?? offer.buyer.latitude,
      destLng: offer.longitude ?? offer.buyer.longitude,
      delayDays,
    });

    rankedOptions.push({
      optionType: 'BUYER',
      buyerOrMarketName: offer.buyer.businessName,
      marketId: null,
      buyerId: offer.buyer.id,
      offerId: offer.id,
      offerPrice: offer.offerPrice,
      transportCost: nr.transportCost,
      storageCost: nr.storageCost,
      distanceKm: nr.distanceKm,
      netRealisation: nr.netRealisation,
      buyerTrustScore: trust,
      qualityMatch,
      district: offer.buyer.district,
      state: offer.buyer.state,
      notes:
        qualityMatch < 100
          ? 'Produce grade is below this buyer’s minimum — expect a deduction or rejection risk.'
          : 'Open digital offer. Net realisation already subtracts transport and storage.',
    });
  }

  rankedOptions.sort((a, b) => b.netRealisation - a.netRealisation);

  const payload = {
    crop: { id: crop.id, name: crop.name, unit: crop.unit },
    quantity: input.quantity,
    qualityGrade: input.qualityGrade,
    location: input.location,
    hasStorage: input.hasStorage,
    sellTimingRecommendation: timing.advice,
    reasoning: timing.reasoning,
    trendPct: timing.trendPct,
    waitDays: timing.waitDays,
    priceTrend: buildTrendPoints(marketPrices),
    rankedOptions,
  };

  await prisma.decisionQuery.create({
    data: {
      farmerId: farmerId || null,
      cropId: input.cropId,
      quantity: input.quantity,
      qualityGrade: input.qualityGrade,
      location: input.location,
      latitude: farmerLat,
      longitude: farmerLng,
      harvestDate: input.harvestDate ? new Date(input.harvestDate) : null,
      hasStorage: input.hasStorage,
      sellTimingRecommendation: timing.advice,
      reasoning: timing.reasoning,
      rankedOptions,
    },
  });

  return payload;
}

function buildTrendPoints(marketPrices) {
  const byDate = new Map();
  for (const row of marketPrices) {
    const key = row.date.toISOString().slice(0, 10);
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key).push(row.modalPrice);
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, prices]) => ({
      date,
      modalPrice: Math.round(prices.reduce((s, p) => s + p, 0) / prices.length),
    }));
}
