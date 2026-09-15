import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  phone: z.string().min(10).max(15).optional(),
  role: z.enum(['FARMER', 'FPO', 'BUYER', 'ADMIN']).default('FARMER'),
  village: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  businessName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const evaluateDecisionSchema = z.object({
  cropId: z.string().uuid(),
  quantity: z.number().positive(),
  qualityGrade: z.enum(['A', 'B', 'C', 'FAQ']),
  location: z.string().min(2),
  harvestDate: z.string().datetime().or(z.string().min(8)).optional(),
  hasStorage: z.boolean().default(false),
  storageDaysAvailable: z.number().int().nonnegative().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const createLotSchema = z.object({
  cropId: z.string().uuid(),
  quantity: z.number().positive(),
  qualityGrade: z.enum(['A', 'B', 'C', 'FAQ']),
  harvestDate: z.string().min(8),
  location: z.string().min(2),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  hasStorage: z.boolean().default(false),
  storageDaysAvailable: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
  fpoId: z.string().uuid().optional(),
});

export const createOfferSchema = z.object({
  cropId: z.string().uuid(),
  lotId: z.string().uuid().optional(),
  quantity: z.number().positive(),
  offerPrice: z.number().positive(),
  minGrade: z.enum(['A', 'B', 'C', 'FAQ']).default('C'),
  validUntil: z.string().optional(),
  pickupLocation: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const createTransactionSchema = z.object({
  lotId: z.string().uuid(),
  offerId: z.string().uuid(),
  quantity: z.number().positive(),
  agreedPrice: z.number().positive(),
  expectedPayDate: z.string().optional(),
});

export const createGrievanceSchema = z.object({
  transactionId: z.string().uuid().optional(),
  subject: z.string().min(4).max(160),
  description: z.string().min(8).max(4000),
});

export const createFpoSchema = z.object({
  name: z.string().min(3).max(160),
  district: z.string().optional(),
  state: z.string().optional(),
});

export const addFpoMemberSchema = z.object({
  userId: z.string().uuid(),
});

export function parseBody(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const message = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    const err = new Error(message || 'Invalid request body');
    err.statusCode = 400;
    throw err;
  }
  return result.data;
}
