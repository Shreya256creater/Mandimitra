import prisma from '../../config/prisma.js';

export async function listLots({ farmerId, fpoId, status }) {
  const where = {};
  if (farmerId) where.farmerId = farmerId;
  if (fpoId) where.fpoId = fpoId;
  if (status) where.status = status;

  return prisma.lot.findMany({
    where,
    include: { crop: true, farmer: { select: { id: true, name: true, district: true } }, fpo: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createLot(farmerId, data) {
  return prisma.lot.create({
    data: {
      farmerId,
      cropId: data.cropId,
      quantity: data.quantity,
      qualityGrade: data.qualityGrade,
      harvestDate: new Date(data.harvestDate),
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      hasStorage: data.hasStorage,
      storageDaysAvailable: data.storageDaysAvailable,
      notes: data.notes,
      fpoId: data.fpoId,
      status: 'LISTED',
    },
    include: { crop: true },
  });
}

export async function getLot(id) {
  const lot = await prisma.lot.findUnique({
    where: { id },
    include: { crop: true, offers: true, farmer: { select: { id: true, name: true } } },
  });
  if (!lot) {
    const err = new Error('Lot not found');
    err.statusCode = 404;
    throw err;
  }
  return lot;
}
