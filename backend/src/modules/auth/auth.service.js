import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma.js';

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
}

function publicUser(user) {
  const { password, ...safe } = user;
  return safe;
}

export async function register(data) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  const password = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password,
      role: data.role,
      village: data.village,
      district: data.district,
      state: data.state,
      latitude: data.latitude,
      longitude: data.longitude,
    },
  });

  if (data.role === 'BUYER') {
    await prisma.buyer.create({
      data: {
        userId: user.id,
        businessName: data.businessName || data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        district: data.district,
        state: data.state,
      },
    });
  }

  return { token: signToken(user), user: publicUser(user) };
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { buyerProfile: true },
  });
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  return { token: signToken(user), user: publicUser(user) };
}

export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { buyerProfile: true, fpoMemberships: { include: { fpo: true } } },
  });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return publicUser(user);
}
