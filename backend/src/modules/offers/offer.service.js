import prisma from '../../config/prisma.js';

export async function listOffers({ cropId, buyerId, status }) {
  const where = {};
  if (cropId) where.cropId = cropId;
  if (buyerId) where.buyerId = buyerId;
  if (status) where.status = status;

  return prisma.offer.findMany({
    where,
    include: {
      crop: true,
      buyer: { select: { id: true, businessName: true, trustScore: true, district: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createOffer(userId, data) {
  const buyer = await prisma.buyer.findUnique({ where: { userId } });
  if (!buyer) {
    const err = new Error('Buyer profile required to create offers');
    err.statusCode = 403;
    throw err;
  }

  return prisma.offer.create({
    data: {
      buyerId: buyer.id,
      cropId: data.cropId,
      lotId: data.lotId,
      quantity: data.quantity,
      offerPrice: data.offerPrice,
      minGrade: data.minGrade,
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      pickupLocation: data.pickupLocation,
      latitude: data.latitude ?? buyer.latitude,
      longitude: data.longitude ?? buyer.longitude,
      status: 'OPEN',
    },
    include: { crop: true },
  });
}
