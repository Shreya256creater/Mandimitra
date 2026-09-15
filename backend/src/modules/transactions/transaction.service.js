import prisma from '../../config/prisma.js';

export async function listTransactions({ userId, role }) {
  const where = {};
  if (role === 'FARMER') {
    where.lot = { farmerId: userId };
  } else if (role === 'BUYER') {
    const buyer = await prisma.buyer.findUnique({ where: { userId } });
    if (buyer) where.buyerId = buyer.id;
  }

  return prisma.transaction.findMany({
    where,
    include: {
      lot: { include: { crop: true, farmer: { select: { id: true, name: true } } } },
      buyer: { select: { businessName: true, trustScore: true } },
      offer: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createTransaction(data) {
  const [lot, offer] = await Promise.all([
    prisma.lot.findUnique({ where: { id: data.lotId } }),
    prisma.offer.findUnique({ where: { id: data.offerId } }),
  ]);

  if (!lot || !offer) {
    const err = new Error('Lot or offer not found');
    err.statusCode = 404;
    throw err;
  }

  const tx = await prisma.transaction.create({
    data: {
      lotId: data.lotId,
      offerId: data.offerId,
      buyerId: offer.buyerId,
      quantity: data.quantity,
      agreedPrice: data.agreedPrice,
      expectedPayDate: data.expectedPayDate ? new Date(data.expectedPayDate) : null,
      status: 'INITIATED',
      paymentStatus: 'PENDING',
    },
    include: { lot: true, buyer: true },
  });

  await prisma.lot.update({ where: { id: lot.id }, data: { status: 'SOLD' } });
  await prisma.offer.update({ where: { id: offer.id }, data: { status: 'ACCEPTED' } });

  return tx;
}

export async function updateTransaction(id, patch) {
  return prisma.transaction.update({
    where: { id },
    data: patch,
  });
}
