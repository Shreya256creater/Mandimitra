import prisma from '../../config/prisma.js';

export async function listFpos() {
  return prisma.fpo.findMany({
    include: {
      lead: { select: { id: true, name: true } },
      _count: { select: { members: true, lots: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getFpoDashboard(fpoId) {
  const fpo = await prisma.fpo.findUnique({
    where: { id: fpoId },
    include: {
      lead: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, village: true, district: true } } } },
      lots: { include: { crop: true, farmer: { select: { name: true } } } },
    },
  });

  if (!fpo) {
    const err = new Error('FPO not found');
    err.statusCode = 404;
    throw err;
  }

  const aggregated = {};
  for (const lot of fpo.lots) {
    const key = `${lot.cropId}:${lot.qualityGrade}`;
    if (!aggregated[key]) {
      aggregated[key] = {
        cropId: lot.cropId,
        cropName: lot.crop.name,
        qualityGrade: lot.qualityGrade,
        totalQuantity: 0,
        lotCount: 0,
      };
    }
    aggregated[key].totalQuantity += lot.quantity;
    aggregated[key].lotCount += 1;
  }

  return { fpo, aggregatedLots: Object.values(aggregated) };
}

export async function createFpo(leadUserId, data) {
  return prisma.fpo.create({
    data: {
      name: data.name,
      leadUserId,
      district: data.district,
      state: data.state,
      members: { create: [{ userId: leadUserId }] },
    },
  });
}

export async function addMember(fpoId, userId) {
  return prisma.fpoMember.create({
    data: { fpoId, userId },
  });
}
