import prisma from '../../config/prisma.js';

export async function listCrops() {
  return prisma.crop.findMany({ orderBy: { name: 'asc' } });
}

/**
 * Resolve a crop from catalogue id or a typed name (including local names like "Dungli").
 * Creates a new Crop row when the farmer types a name that is not in the catalogue yet.
 */
export async function findOrCreateCrop({ cropId, cropName } = {}) {
  if (cropId) {
    const byId = await prisma.crop.findUnique({ where: { id: cropId } });
    if (byId) return byId;
  }

  const raw = String(cropName || '').trim();
  if (!raw) {
    const err = new Error('Select a crop from the list or type a crop name');
    err.statusCode = 400;
    throw err;
  }

  const byName = await prisma.crop.findFirst({
    where: {
      OR: [
        { name: { equals: raw, mode: 'insensitive' } },
        { localName: { equals: raw, mode: 'insensitive' } },
      ],
    },
  });
  if (byName) return byName;

  return prisma.crop.create({
    data: {
      name: titleCaseCrop(raw),
      unit: 'quintal',
    },
  });
}

function titleCaseCrop(name) {
  return name
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
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
