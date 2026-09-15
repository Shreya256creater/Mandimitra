import prisma from '../../config/prisma.js';

export async function listCrops() {
  return prisma.crop.findMany({ orderBy: { name: 'asc' } });
}

export async function listMarkets(query = {}) {
  const where = {};
  if (query.state) where.state = query.state;
  if (query.district) where.district = query.district;
  return prisma.market.findMany({ where, orderBy: { name: 'asc' } });
}

export async function getPrices({ cropId, marketId, days = 14 }) {
  const since = new Date();
  since.setDate(since.getDate() - Number(days));

  const where = { date: { gte: since } };
  if (cropId) where.cropId = cropId;
  if (marketId) where.marketId = marketId;

  return prisma.marketPrice.findMany({
    where,
    include: { market: true, crop: true },
    orderBy: { date: 'asc' },
  });
}

export async function ingestPrice(data) {
  return prisma.marketPrice.upsert({
    where: {
      marketId_cropId_date: {
        marketId: data.marketId,
        cropId: data.cropId,
        date: new Date(data.date),
      },
    },
    update: {
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
      modalPrice: data.modalPrice,
      arrivals: data.arrivals,
    },
    create: {
      marketId: data.marketId,
      cropId: data.cropId,
      date: new Date(data.date),
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
      modalPrice: data.modalPrice,
      arrivals: data.arrivals,
    },
  });
}
