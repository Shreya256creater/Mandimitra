import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DAYS = 14;

function daysAgo(n) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

/**
 * Build a 14-day modal-price series.
 * @param {number} start
 * @param {number} dailyDelta  positive = rising market
 * @param {number} noise
 */
function priceSeries(start, dailyDelta, noise = 8) {
  return Array.from({ length: DAYS }, (_, i) => {
    const jitter = ((i * 7) % 5) - 2;
    return Math.round(start + dailyDelta * i + jitter * noise);
  });
}

async function main() {
  console.log('Seeding MandiMitra…');

  await prisma.decisionQuery.deleteMany();
  await prisma.grievance.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.lot.deleteMany();
  await prisma.fpoMember.deleteMany();
  await prisma.fpo.deleteMany();
  await prisma.marketPrice.deleteMany();
  await prisma.market.deleteMany();
  await prisma.buyer.deleteMany();
  await prisma.crop.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const [onion, wheat, soybean, cotton, turmeric] = await Promise.all([
    prisma.crop.create({ data: { name: 'Onion', localName: 'Kanda', category: 'vegetable' } }),
    prisma.crop.create({ data: { name: 'Wheat', localName: 'Gehu', category: 'cereal' } }),
    prisma.crop.create({ data: { name: 'Soybean', localName: 'Soyabean', category: 'oilseed' } }),
    prisma.crop.create({ data: { name: 'Cotton', localName: 'Kapas', category: 'fibre' } }),
    prisma.crop.create({ data: { name: 'Turmeric', localName: 'Haldi', category: 'spice' } }),
  ]);

  const [lasalgaon, nashik, pune, indore, nagpur] = await Promise.all([
    prisma.market.create({
      data: {
        name: 'Lasalgaon APMC',
        mandiCode: 'MH-LSG',
        district: 'Nashik',
        state: 'Maharashtra',
        latitude: 20.1426,
        longitude: 74.2291,
      },
    }),
    prisma.market.create({
      data: {
        name: 'Nashik APMC',
        mandiCode: 'MH-NSK',
        district: 'Nashik',
        state: 'Maharashtra',
        latitude: 19.9975,
        longitude: 73.7898,
      },
    }),
    prisma.market.create({
      data: {
        name: 'Pune Market Yard',
        mandiCode: 'MH-PUN',
        district: 'Pune',
        state: 'Maharashtra',
        latitude: 18.5204,
        longitude: 73.8567,
      },
    }),
    prisma.market.create({
      data: {
        name: 'Indore Krishi Upaj Mandi',
        mandiCode: 'MP-IDR',
        district: 'Indore',
        state: 'Madhya Pradesh',
        latitude: 22.7196,
        longitude: 75.8577,
      },
    }),
    prisma.market.create({
      data: {
        name: 'Nagpur APMC',
        mandiCode: 'MH-NGP',
        district: 'Nagpur',
        state: 'Maharashtra',
        latitude: 21.1458,
        longitude: 79.0882,
      },
    }),
  ]);

  // Onion: rising (wait may pay off). Wheat: falling (sell now). Soybean: flat.
  const series = [
    { cropId: onion.id, start: 1480, delta: 22, markets: [lasalgaon, nashik, pune] },
    { cropId: wheat.id, start: 2420, delta: -18, markets: [pune, nagpur, indore] },
    { cropId: soybean.id, start: 4300, delta: 2, markets: [indore, nagpur] },
    { cropId: cotton.id, start: 6800, delta: -8, markets: [nagpur, nashik] },
    { cropId: turmeric.id, start: 12500, delta: 40, markets: [nashik, pune] },
  ];

  const priceRows = [];
  for (const s of series) {
    for (const market of s.markets) {
      const modal = priceSeries(s.start, s.delta);
      modal.forEach((modalPrice, i) => {
        priceRows.push({
          marketId: market.id,
          cropId: s.cropId,
          date: daysAgo(DAYS - 1 - i),
          minPrice: modalPrice - 80,
          maxPrice: modalPrice + 90,
          modalPrice,
          arrivals: 800 + i * 15,
        });
      });
    }
  }
  await prisma.marketPrice.createMany({ data: priceRows });

  const farmer = await prisma.user.create({
    data: {
      name: 'Ramesh Patil',
      email: 'farmer@mandimitra.test',
      phone: '9000000001',
      password: passwordHash,
      role: 'FARMER',
      village: 'Niphad',
      district: 'Nashik',
      state: 'Maharashtra',
      latitude: 20.0793,
      longitude: 74.1102,
      address: 'Niphad, Nashik, Maharashtra',
    },
  });

  const fpoLead = await prisma.user.create({
    data: {
      name: 'Sunita Kale',
      email: 'fpo@mandimitra.test',
      phone: '9000000002',
      password: passwordHash,
      role: 'FPO',
      district: 'Nashik',
      state: 'Maharashtra',
      latitude: 20.0059,
      longitude: 73.7799,
    },
  });

  const fpo = await prisma.fpo.create({
    data: {
      name: 'Nashik Onion Growers FPO',
      leadUserId: fpoLead.id,
      district: 'Nashik',
      state: 'Maharashtra',
      members: {
        create: [{ userId: farmer.id }, { userId: fpoLead.id }],
      },
    },
  });

  const buyerSpecs = [
    {
      name: 'Vikram Traders',
      email: 'buyer1@mandimitra.test',
      phone: '9100000001',
      businessName: 'Vikram Agri Traders',
      onTimePaymentRate: 0.94,
      avgPaymentDelayDays: 1.2,
      totalDealsCompleted: 86,
      trustScore: 91,
      minQualityGrade: 'B',
      latitude: 20.14,
      longitude: 74.23,
      district: 'Nashik',
      state: 'Maharashtra',
      onionPrice: 1720,
      wheatPrice: 2280,
    },
    {
      name: 'Pune Fresh Mandi Pvt Ltd',
      email: 'buyer2@mandimitra.test',
      phone: '9100000002',
      businessName: 'Pune Fresh Mandi',
      onTimePaymentRate: 0.81,
      avgPaymentDelayDays: 4.5,
      totalDealsCompleted: 42,
      trustScore: 72,
      minQualityGrade: 'A',
      latitude: 18.52,
      longitude: 73.86,
      district: 'Pune',
      state: 'Maharashtra',
      onionPrice: 1850,
      wheatPrice: 2350,
    },
    {
      name: 'Indore Grain Hub',
      email: 'buyer3@mandimitra.test',
      phone: '9100000003',
      businessName: 'Indore Grain Hub',
      onTimePaymentRate: 0.62,
      avgPaymentDelayDays: 11,
      totalDealsCompleted: 19,
      trustScore: 48,
      minQualityGrade: 'C',
      latitude: 22.72,
      longitude: 75.86,
      district: 'Indore',
      state: 'Madhya Pradesh',
      onionPrice: 1900,
      wheatPrice: 2400,
    },
    {
      name: 'Nagpur Cotton & Pulses Co',
      email: 'buyer4@mandimitra.test',
      phone: '9100000004',
      businessName: 'Nagpur Cotton & Pulses Co',
      onTimePaymentRate: 0.88,
      avgPaymentDelayDays: 2.4,
      totalDealsCompleted: 61,
      trustScore: 83,
      minQualityGrade: 'B',
      latitude: 21.15,
      longitude: 79.09,
      district: 'Nagpur',
      state: 'Maharashtra',
      onionPrice: 1680,
      wheatPrice: 2320,
    },
  ];

  const buyers = [];
  for (const spec of buyerSpecs) {
    const user = await prisma.user.create({
      data: {
        name: spec.name,
        email: spec.email,
        phone: spec.phone,
        password: passwordHash,
        role: 'BUYER',
        district: spec.district,
        state: spec.state,
        latitude: spec.latitude,
        longitude: spec.longitude,
      },
    });
    const buyer = await prisma.buyer.create({
      data: {
        userId: user.id,
        businessName: spec.businessName,
        minQualityGrade: spec.minQualityGrade,
        onTimePaymentRate: spec.onTimePaymentRate,
        avgPaymentDelayDays: spec.avgPaymentDelayDays,
        totalDealsCompleted: spec.totalDealsCompleted,
        trustScore: spec.trustScore,
        latitude: spec.latitude,
        longitude: spec.longitude,
        district: spec.district,
        state: spec.state,
      },
    });
    buyers.push({ ...buyer, onionPrice: spec.onionPrice, wheatPrice: spec.wheatPrice });
  }

  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@mandimitra.test',
      phone: '9990000000',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  const lot = await prisma.lot.create({
    data: {
      farmerId: farmer.id,
      fpoId: fpo.id,
      cropId: onion.id,
      quantity: 40,
      qualityGrade: 'A',
      harvestDate: daysAgo(2),
      location: 'Niphad, Nashik, Maharashtra',
      latitude: 20.0793,
      longitude: 74.1102,
      hasStorage: true,
      storageDaysAvailable: 12,
      status: 'LISTED',
    },
  });

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 5);

  for (const b of buyers) {
    await prisma.offer.create({
      data: {
        buyerId: b.id,
        cropId: onion.id,
        quantity: 50,
        offerPrice: b.onionPrice,
        minGrade: b.minQualityGrade,
        validUntil,
        pickupLocation: `${b.district}, ${b.state}`,
        latitude: b.latitude,
        longitude: b.longitude,
        status: 'OPEN',
      },
    });
    await prisma.offer.create({
      data: {
        buyerId: b.id,
        cropId: wheat.id,
        quantity: 80,
        offerPrice: b.wheatPrice,
        minGrade: b.minQualityGrade,
        validUntil,
        pickupLocation: `${b.district}, ${b.state}`,
        latitude: b.latitude,
        longitude: b.longitude,
        status: 'OPEN',
      },
    });
  }

  console.log('Seed complete.');
  console.log('Demo logins (password: Password123!):');
  console.log('  farmer@mandimitra.test  (FARMER)');
  console.log('  fpo@mandimitra.test     (FPO)');
  console.log('  buyer1@mandimitra.test  (BUYER — high trust)');
  console.log('  admin@mandimitra.test   (ADMIN)');
  console.log(`Sample lot: ${lot.id} (Onion, 40q, Nashik)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
