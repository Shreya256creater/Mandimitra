# MandiMitra — Smart Selling Decision System

MandiMitra is **not** a farmer–buyer marketplace clone. Farmers already see listed prices. What they lack is a clear answer to:

> *If I sell this lot, to this buyer or mandi, after transport, storage, grade match, and payment risk — what do I actually take home? And should I sell today or wait?*

The product’s core is a **Net Realisation Engine**. It ranks options by take-home ₹/quintal, attaches a **sell-timing** recommendation, and shows a **Buyer Trust Score** on every row.

## What the engine returns

`POST /api/decision-engine/evaluate`

```json
{
  "sellTimingRecommendation": "SELL_NOW | WAIT_FEW_DAYS | SELL_PART_STORE_REST",
  "reasoning": "...",
  "rankedOptions": [
    {
      "buyerOrMarketName": "Pune Fresh Mandi",
      "offerPrice": 1850,
      "transportCost": 210,
      "storageCost": 14,
      "netRealisation": 1626,
      "buyerTrustScore": 72,
      "qualityMatch": 100
    }
  ]
}
```

Rows are sorted by **net realisation**, never by headline price alone.

MVP logic is rule-based and formula-based on purpose. Each calculator is isolated so a time-series / ML model can replace it later without changing the API contract:

| Module | File | Swap-out point |
| --- | --- | --- |
| Net realisation | `backend/src/modules/decision-engine/netRealisation.calculator.js` | `calculateNetRealisation()` |
| Sell timing | `backend/src/modules/decision-engine/sellTiming.recommender.js` | `recommendSellTiming()` |
| Buyer trust | `backend/src/modules/decision-engine/buyerTrustScore.calculator.js` | `calculateBuyerTrustScore()` |

### Formulas (MVP)

- **Net realisation** = offer price − transport (₹/km/quintal × Haversine km) − storage (₹/day/quintal × delay days)
- **Trust score (0–100)** = 50% on-time payment rate + 30% deals completed (capped at 50) + 20% inverse of average payment delay
- **Sell timing** = 7–14 day modal-price trend. Rising + storage → wait or split; flat/falling or no storage → sell now

Every evaluation is stored in `DecisionQuery` (inputs + recommendation JSON) so a feedback dataset can be built later.

## Stack

- PostgreSQL + Prisma ORM
- Express (plain JavaScript, ES modules)
- React + Vite + Tailwind CSS (JSX, no TypeScript)
- JWT auth, bcryptjs passwords, Zod validation

## Local setup

### 1. Start Postgres

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
copy .env.example .env   # Windows
# cp .env.example .env  # macOS / Linux
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

API: [http://localhost:5000](http://localhost:5000) · health check: `/health`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: [http://localhost:5173](http://localhost:5173)

Vite proxies `/api` to the backend, so no extra CORS setup is required in development.

## Demo accounts

Seeded by `backend/prisma/seed.js` (idempotent; passwords hashed with bcrypt, 10 rounds — same as register).

| Email | Password | Role |
| --- | --- | --- |
| farmer@mandimitra.com | Farmer@123 | Farmer (Unjha, Mehsana) |
| buyer@mandimitra.com | Buyer@123 | Nearby high-trust buyer |
| admin@mandimitra.com | Admin@123 | Admin |
| fpo@mandimitra.com | Fpo@123 | FPO lead |

Extra buyers (`buyer.indore@…`, `buyer.ahmedabad@…`, `buyer.rajkot@…`, `buyer.surat@…`) all use `Buyer@123`. Indore posts the highest onion *listed* price; Unjha should still win on **net realisation** after transport.

14-day mandi series: **Onion / Soybean** rising (wait or split if storage is on). **Wheat / Tomato / Maize** falling → sell now. **Cotton** flat → sell now.

Walkthrough: login as the farmer → **Sell decision** → pick Onion, keep storage checked → timing banner + table ranked by net realisation.

## Main API routes

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Register FARMER / FPO / BUYER / ADMIN |
| POST | `/api/auth/login` | JWT login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/market/crops` | Crop catalogue |
| GET | `/api/market/prices` | Historical mandi prices |
| **POST** | **`/api/decision-engine/evaluate`** | **Net realisation + timing + trust** |
| GET/POST | `/api/lots` | Farmer produce lots |
| GET/POST | `/api/offers` | Buyer digital offers |
| GET/POST | `/api/transactions` | Payment + logistics |
| GET/POST | `/api/grievances` | Disputes |
| GET/POST | `/api/fpo` | FPO aggregation |

## Project layout

```
backend/   Express API, Prisma schema, decision engine
frontend/  Vite React app (sell form → decision results)
```
