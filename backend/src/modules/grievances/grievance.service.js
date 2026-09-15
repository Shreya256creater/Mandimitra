import prisma from '../../config/prisma.js';

export async function listGrievances(user) {
  const where = user.role === 'ADMIN' ? {} : { userId: user.id };
  return prisma.grievance.findMany({
    where,
    include: { transaction: true, user: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createGrievance(userId, data) {
  return prisma.grievance.create({
    data: {
      userId,
      transactionId: data.transactionId,
      subject: data.subject,
      description: data.description,
    },
  });
}

export async function updateGrievance(id, data) {
  return prisma.grievance.update({
    where: { id },
    data: {
      status: data.status,
      resolution: data.resolution,
    },
  });
}
