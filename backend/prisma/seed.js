import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

/**
 * Idempotent local-dev seed for MandiMitra.
 *
 * Compatible with the CURRENT Prisma schema only — no extra tables/fields.
 * Safe to re-run: upserts by natural keys (email, mandiCode, crop name,
 * marketId+cropId+date). Never calls deleteMany / migrate reset.
 *
 * Password hashing matches auth.service.js: bcrypt.hash(plain, 10).
 */

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 10;
const PRICE_DAYS = 14;
const DEMO_TAG = '[DEMO-SEED]';

function utcDay(daysBack) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - daysBack);
  return d;
}

function priceSeries(start, dailyDelta, noise = 8) {
  return Array.from({ length: PRICE_DAYS }, (_, i) => {
    const jitter = ((i * 7) % 5) - 2;
    return Math.round(start + dailyDelta * i + jitter * noise);
  });
}

async function upsertUser(data) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    const { phone, email, ...rest } = data;
    return prisma.user.update({
      where: { email },
      data: rest,
    });
  }
  return prisma.user.create({ data });
}

async function upsertCrop(data) {
  const existing = await prisma.crop.findFirst({ where: { name: data.name } });
  if (existing) {
    return prisma.crop.update({ where: { id: existing.id }, data });
  }
  return prisma.crop.create({ data });
}

async function upsertLot(data) {
  const existing = await prisma.lot.findFirst({
    where: { farmerId: data.farmerId, cropId: data.cropId, notes: data.notes },
  });
  if (existing) {
    return prisma.lot.update({ where: { id: existing.id }, data });
  }
  return prisma.lot.create({ data });
}

async function upsertOpenOffer(data) {
  const existing = await prisma.offer.findFirst({
    where: { buyerId: data.buyerId, cropId: data.cropId, status: 'OPEN' },
    orderBy: { createdAt: 'asc' },
  });
  if (existing) {
    return prisma.offer.update({ where: { id: existing.id }, data });
  }
  return prisma.offer.create({ data });
}

async function main() {
  console.log('Seeding MandiMitra (idempotent, no deletes)…');

  const [farmerHash, buyerHash, adminHash, fpoHash] = await Promise.all([
    bcrypt.hash('Farmer@123', BCRYPT_ROUNDS),
    bcrypt.hash('Buyer@123', BCRYPT_ROUNDS),
    bcrypt.hash('Admin@123', BCRYPT_ROUNDS),
    bcrypt.hash('Fpo@123', BCRYPT_ROUNDS),
  ]);

  const crops = {};
  for (const row of [
    { name: 'Wheat', localName: 'Ghau', category: 'cereal' },
    { name: 'Rice', localName: 'Chokha / Dangar', category: 'cereal' },
    { name: 'Cotton', localName: 'Kapas', category: 'fibre' },
    { name: 'Soybean', localName: 'Soyabean', category: 'oilseed' },
    { name: 'Onion', localName: 'Dungli', category: 'vegetable' },
    { name: 'Tomato', localName: 'Tameta', category: 'vegetable' },
    { name: 'Maize', localName: 'Makai', category: 'cereal' },
  ]) {
    crops[row.name] = await upsertCrop(row);
  }

  const marketSpecs = [
    { name: 'Unjha APMC', mandiCode: 'GJ-UNJ', district: 'Mehsana', state: 'Gujarat', latitude: 23.8037, longitude: 72.391 },
    { name: 'Mehsana APMC', mandiCode: 'GJ-MHS', district: 'Mehsana', state: 'Gujarat', latitude: 23.588, longitude: 72.3693 },
    { name: 'Ahmedabad Jamalpur APMC', mandiCode: 'GJ-AMD', district: 'Ahmedabad', state: 'Gujarat', latitude: 23.014, longitude: 72.588 },
    { name: 'Rajkot APMC', mandiCode: 'GJ-RAJ', district: 'Rajkot', state: 'Gujarat', latitude: 22.3039, longitude: 70.8022 },
    { name: 'Vadodara APMC', mandiCode: 'GJ-VAD', district: 'Vadodara', state: 'Gujarat', latitude: 22.3072, longitude: 73.1812 },
    { name: 'Surat APMC', mandiCode: 'GJ-SUR', district: 'Surat', state: 'Gujarat', latitude: 21.1702, longitude: 72.8311 },
    { name: 'Bhavnagar APMC', mandiCode: 'GJ-BHV', district: 'Bhavnagar', state: 'Gujarat', latitude: 21.7645, longitude: 72.1519 },
    { name: 'Indore Krishi Upaj Mandi', mandiCode: 'MP-IDR', district: 'Indore', state: 'Madhya Pradesh', latitude: 22.7196, longitude: 75.8577 },
  ];

  const markets = {};
  for (const spec of marketSpecs) {
    markets[spec.mandiCode] = await prisma.market.upsert({
      where: { mandiCode: spec.mandiCode },
      update: spec,
      create: spec,
    });
  }

  /**
   * Price paths chosen to exercise sell-timing rules:
   *   Onion / Soybean  → rising  (WAIT / SELL_PART_STORE_REST if storage on)
   *   Rice             → mild rise (WAIT_FEW_DAYS with storage)
   *   Wheat / Tomato / Maize / Cotton → flat or falling (SELL_NOW)
   */
  const series = [
    { crop: 'Onion', start: 1520, delta: 28, codes: ['GJ-UNJ', 'GJ-MHS', 'GJ-AMD', 'GJ-VAD'] },
    { crop: 'Soybean', start: 4180, delta: 22, codes: ['GJ-RAJ', 'GJ-AMD', 'MP-IDR'] },
    { crop: 'Rice', start: 1980, delta: 5, codes: ['GJ-SUR', 'GJ-VAD', 'GJ-AMD'] },
    { crop: 'Wheat', start: 2480, delta: -16, codes: ['GJ-UNJ', 'GJ-MHS', 'GJ-AMD', 'MP-IDR'] },
    { crop: 'Tomato', start: 1680, delta: -24, codes: ['GJ-AMD', 'GJ-VAD', 'GJ-SUR'] },
    { crop: 'Maize', start: 2050, delta: -12, codes: ['GJ-MHS', 'GJ-RAJ', 'GJ-BHV'] },
    { crop: 'Cotton', start: 7050, delta: 1, codes: ['GJ-RAJ', 'GJ-BHV', 'GJ-SUR'] },
  ];

  for (const s of series) {
    const cropId = crops[s.crop].id;
    for (const code of s.codes) {
      const market = markets[code];
      const modal = priceSeries(s.start, s.delta);
      for (let i = 0; i < modal.length; i += 1) {
        const modalPrice = modal[i];
        const date = utcDay(PRICE_DAYS - 1 - i);
        await prisma.marketPrice.upsert({
          where: {
            marketId_cropId_date: { marketId: market.id, cropId, date },
          },
          update: {
            minPrice: modalPrice - 80,
            maxPrice: modalPrice + 90,
            modalPrice,
            arrivals: 600 + i * 20,
          },
          create: {
            marketId: market.id,
            cropId,
            date,
            minPrice: modalPrice - 80,
            maxPrice: modalPrice + 90,
            modalPrice,
            arrivals: 600 + i * 20,
          },
        });
      }
    }
  }

  const farmer = await upsertUser({
    name: 'Ramesh Patel',
    email: 'farmer@mandimitra.com',
    phone: '9876500001',
    password: farmerHash,
    role: 'FARMER',
    village: 'Unjha',
    district: 'Mehsana',
    state: 'Gujarat',
    latitude: 23.8037,
    longitude: 72.391,
    address: 'Unjha, Mehsana, Gujarat',
  });

  const farmer2 = await upsertUser({
    name: 'Kiran Desai',
    email: 'farmer2@mandimitra.com',
    phone: '9876500002',
    password: farmerHash,
    role: 'FARMER',
    village: 'Visnagar',
    district: 'Mehsana',
    state: 'Gujarat',
    latitude: 23.7,
    longitude: 72.552,
    address: 'Visnagar, Mehsana, Gujarat',
  });

  const fpoLead = await upsertUser({
    name: 'Sunita Chaudhary',
    email: 'fpo@mandimitra.com',
    phone: '9876500003',
    password: fpoHash,
    role: 'FPO',
    district: 'Mehsana',
    state: 'Gujarat',
    latitude: 23.588,
    longitude: 72.3693,
    address: 'Mehsana, Gujarat',
  });

  await upsertUser({
    name: 'MandiMitra Admin',
    email: 'admin@mandimitra.com',
    phone: '9876500000',
    password: adminHash,
    role: 'ADMIN',
    district: 'Ahmedabad',
    state: 'Gujarat',
  });

  let fpo = await prisma.fpo.findFirst({ where: { name: 'Mehsana Farmers Producer Company' } });
  if (fpo) {
    fpo = await prisma.fpo.update({
      where: { id: fpo.id },
      data: { leadUserId: fpoLead.id, district: 'Mehsana', state: 'Gujarat' },
    });
  } else {
    fpo = await prisma.fpo.create({
      data: {
        name: 'Mehsana Farmers Producer Company',
        leadUserId: fpoLead.id,
        district: 'Mehsana',
        state: 'Gujarat',
      },
    });
  }

  for (const userId of [farmer.id, farmer2.id, fpoLead.id]) {
    await prisma.fpoMember.upsert({
      where: { fpoId_userId: { fpoId: fpo.id, userId } },
      update: {},
      create: { fpoId: fpo.id, userId },
    });
  }

  /**
   * Buyers placed so listed price ≠ net realisation:
   * local Unjha buyer (demo) is close + high trust;
   * Indore posts the highest onion ticket but ~400 km of transport.
   */
  const buyerSpecs = [
    {
      name: 'Harshad Patel',
      email: 'buyer@mandimitra.com',
      phone: '9876510001',
      businessName: 'Unjha Patel Agri Traders',
      gstin: '24AABCU1234A1Z5',
      minQualityGrade: 'B',
      onTimePaymentRate: 0.95,
      avgPaymentDelayDays: 1,
      totalDealsCompleted: 92,
      trustScore: 93,
      latitude: 23.81,
      longitude: 72.4,
      district: 'Mehsana',
      state: 'Gujarat',
      address: 'APMC Yard, Unjha, Gujarat',
      offers: {
        Onion: { price: 1780, qty: 60, minGrade: 'B' },
        Wheat: { price: 2360, qty: 80, minGrade: 'B' },
        Cotton: { price: 6980, qty: 40, minGrade: 'B' },
        Soybean: { price: 4420, qty: 50, minGrade: 'B' },
        Rice: { price: 2040, qty: 40, minGrade: 'B' },
        Tomato: { price: 1420, qty: 30, minGrade: 'C' },
        Maize: { price: 1980, qty: 50, minGrade: 'C' },
      },
    },
    {
      name: 'Imran Qureshi',
      email: 'buyer.indore@mandimitra.com',
      phone: '9876510002',
      businessName: 'Indore Grain Hub',
      gstin: '23AABCI5678B1Z2',
      minQualityGrade: 'C',
      onTimePaymentRate: 0.61,
      avgPaymentDelayDays: 12,
      totalDealsCompleted: 18,
      trustScore: 46,
      latitude: 22.7196,
      longitude: 75.8577,
      district: 'Indore',
      state: 'Madhya Pradesh',
      address: 'Krishi Upaj Mandi, Indore',
      offers: {
        Onion: { price: 1960, qty: 80, minGrade: 'C' },
        Wheat: { price: 2490, qty: 100, minGrade: 'C' },
        Soybean: { price: 4580, qty: 70, minGrade: 'C' },
      },
    },
    {
      name: 'Nidhi Shah',
      email: 'buyer.ahmedabad@mandimitra.com',
      phone: '9876510003',
      businessName: 'Ahmedabad Fresh Mandi Pvt Ltd',
      gstin: '24AABCA9012C1Z8',
      minQualityGrade: 'A',
      onTimePaymentRate: 0.82,
      avgPaymentDelayDays: 4,
      totalDealsCompleted: 44,
      trustScore: 74,
      latitude: 23.0225,
      longitude: 72.5714,
      district: 'Ahmedabad',
      state: 'Gujarat',
      address: 'Jamalpur APMC, Ahmedabad',
      offers: {
        Onion: { price: 1880, qty: 50, minGrade: 'A' },
        Tomato: { price: 1550, qty: 25, minGrade: 'A' },
        Wheat: { price: 2410, qty: 60, minGrade: 'A' },
        Rice: { price: 2120, qty: 40, minGrade: 'A' },
      },
    },
    {
      name: 'Jignesh Joshi',
      email: 'buyer.rajkot@mandimitra.com',
      phone: '9876510004',
      businessName: 'Rajkot Cotton & Oilseeds Co',
      gstin: '24AABCJ3456D1Z1',
      minQualityGrade: 'B',
      onTimePaymentRate: 0.89,
      avgPaymentDelayDays: 2.2,
      totalDealsCompleted: 67,
      trustScore: 85,
      latitude: 22.3039,
      longitude: 70.8022,
      district: 'Rajkot',
      state: 'Gujarat',
      address: 'APMC Rajkot',
      offers: {
        Cotton: { price: 7220, qty: 80, minGrade: 'B' },
        Soybean: { price: 4490, qty: 60, minGrade: 'B' },
        Maize: { price: 2010, qty: 55, minGrade: 'B' },
        Wheat: { price: 2330, qty: 70, minGrade: 'B' },
      },
    },
    {
      name: 'Farhan Shaikh',
      email: 'buyer.surat@mandimitra.com',
      phone: '9876510005',
      businessName: 'Surat Quick Buy Traders',
      gstin: '24AABCS7890E1Z4',
      minQualityGrade: 'C',
      onTimePaymentRate: 0.54,
      avgPaymentDelayDays: 15,
      totalDealsCompleted: 11,
      trustScore: 38,
      latitude: 21.1702,
      longitude: 72.8311,
      district: 'Surat',
      state: 'Gujarat',
      address: 'Surat APMC',
      offers: {
        Onion: { price: 1910, qty: 45, minGrade: 'C' },
        Tomato: { price: 1600, qty: 20, minGrade: 'C' },
        Rice: { price: 2080, qty: 35, minGrade: 'C' },
      },
    },
  ];

  const validUntil = new Date();
  validUntil.setUTCDate(validUntil.getUTCDate() + 10);

  for (const spec of buyerSpecs) {
    const { offers, ...userFields } = spec;
    const user = await upsertUser({
      name: userFields.name,
      email: userFields.email,
      phone: userFields.phone,
      password: buyerHash,
      role: 'BUYER',
      latitude: userFields.latitude,
      longitude: userFields.longitude,
      district: userFields.district,
      state: userFields.state,
      address: userFields.address,
    });

    const buyer = await prisma.buyer.upsert({
      where: { userId: user.id },
      update: {
        businessName: userFields.businessName,
        gstin: userFields.gstin,
        minQualityGrade: userFields.minQualityGrade,
        onTimePaymentRate: userFields.onTimePaymentRate,
        avgPaymentDelayDays: userFields.avgPaymentDelayDays,
        totalDealsCompleted: userFields.totalDealsCompleted,
        trustScore: userFields.trustScore,
        latitude: userFields.latitude,
        longitude: userFields.longitude,
        address: userFields.address,
        district: userFields.district,
        state: userFields.state,
      },
      create: {
        userId: user.id,
        businessName: userFields.businessName,
        gstin: userFields.gstin,
        minQualityGrade: userFields.minQualityGrade,
        onTimePaymentRate: userFields.onTimePaymentRate,
        avgPaymentDelayDays: userFields.avgPaymentDelayDays,
        totalDealsCompleted: userFields.totalDealsCompleted,
        trustScore: userFields.trustScore,
        latitude: userFields.latitude,
        longitude: userFields.longitude,
        address: userFields.address,
        district: userFields.district,
        state: userFields.state,
      },
    });

    for (const [cropName, offer] of Object.entries(offers)) {
      await upsertOpenOffer({
        buyerId: buyer.id,
        cropId: crops[cropName].id,
        quantity: offer.qty,
        offerPrice: offer.price,
        minGrade: offer.minGrade,
        validUntil,
        pickupLocation: `${userFields.district}, ${userFields.state}`,
        latitude: userFields.latitude,
        longitude: userFields.longitude,
        status: 'OPEN',
      });
    }
  }

  const lotBase = {
    farmerId: farmer.id,
    fpoId: fpo.id,
    location: 'Unjha, Mehsana, Gujarat',
    latitude: 23.8037,
    longitude: 72.391,
  };

  await upsertLot({
    ...lotBase,
    cropId: crops.Onion.id,
    quantity: 40,
    qualityGrade: 'A',
    harvestDate: utcDay(3),
    hasStorage: true,
    storageDaysAvailable: 12,
    status: 'LISTED',
    notes: `${DEMO_TAG} Onion — storage on, rising market → expect WAIT / PARTIAL`,
  });

  await upsertLot({
    ...lotBase,
    cropId: crops.Wheat.id,
    quantity: 55,
    qualityGrade: 'B',
    harvestDate: utcDay(8),
    hasStorage: false,
    storageDaysAvailable: 0,
    status: 'LISTED',
    notes: `${DEMO_TAG} Wheat — no storage, falling market → expect SELL_NOW`,
  });

  await upsertLot({
    ...lotBase,
    cropId: crops.Soybean.id,
    quantity: 30,
    qualityGrade: 'A',
    harvestDate: utcDay(4),
    hasStorage: true,
    storageDaysAvailable: 14,
    status: 'LISTED',
    notes: `${DEMO_TAG} Soybean — storage on, strong rise → expect SELL_PART_STORE_REST`,
  });

  await upsertLot({
    ...lotBase,
    cropId: crops.Tomato.id,
    quantity: 12,
    qualityGrade: 'A',
    harvestDate: utcDay(1),
    hasStorage: true,
    storageDaysAvailable: 4,
    status: 'LISTED',
    notes: `${DEMO_TAG} Tomato — perishable, falling market → expect SELL_NOW`,
  });

  await upsertLot({
    ...lotBase,
    cropId: crops.Cotton.id,
    quantity: 25,
    qualityGrade: 'B',
    harvestDate: utcDay(6),
    hasStorage: true,
    storageDaysAvailable: 20,
    status: 'LISTED',
    notes: `${DEMO_TAG} Cotton — flat trend → expect SELL_NOW`,
  });

  await upsertLot({
    farmerId: farmer2.id,
    fpoId: fpo.id,
    cropId: crops.Rice.id,
    quantity: 18,
    qualityGrade: 'FAQ',
    harvestDate: utcDay(5),
    location: 'Visnagar, Mehsana, Gujarat',
    latitude: 23.7,
    longitude: 72.552,
    hasStorage: true,
    storageDaysAvailable: 10,
    status: 'LISTED',
    notes: `${DEMO_TAG} Rice (member farmer) — mild rise + storage → expect WAIT_FEW_DAYS`,
  });

  await upsertLot({
    ...lotBase,
    cropId: crops.Maize.id,
    quantity: 22,
    qualityGrade: 'C',
    harvestDate: utcDay(7),
    hasStorage: false,
    storageDaysAvailable: 0,
    status: 'LISTED',
    notes: `${DEMO_TAG} Maize — no storage, falling → expect SELL_NOW`,
  });

  console.log('\nSeed complete (existing non-demo rows were left untouched).');
  console.log('\nDemo logins (bcrypt, 10 rounds — same as register):');
  console.log('  farmer@mandimitra.com              Farmer@123   FARMER  Unjha, Mehsana');
  console.log('  farmer2@mandimitra.com             Farmer@123   FARMER  Visnagar (FPO member)');
  console.log('  buyer@mandimitra.com               Buyer@123    BUYER   Unjha — high trust, nearby');
  console.log('  buyer.indore@mandimitra.com        Buyer@123    BUYER   highest listed price, far');
  console.log('  buyer.ahmedabad@mandimitra.com     Buyer@123    BUYER   grade A, medium distance');
  console.log('  buyer.rajkot@mandimitra.com        Buyer@123    BUYER   cotton/oilseeds');
  console.log('  buyer.surat@mandimitra.com         Buyer@123    BUYER   high price, weak payment history');
  console.log('  fpo@mandimitra.com                 Fpo@123      FPO');
  console.log('  admin@mandimitra.com               Admin@123    ADMIN');
  console.log('\nDecision-engine checks (login as farmer → Sell decision):');
  console.log('  Onion + storage ON   → WAIT_FEW_DAYS or SELL_PART_STORE_REST');
  console.log('  Wheat + storage OFF  → SELL_NOW (falling mandi prices)');
  console.log('  Soybean + storage ON → SELL_PART_STORE_REST');
  console.log('  Net realisation: Unjha buyer should beat Indore despite a lower onion ticket.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
