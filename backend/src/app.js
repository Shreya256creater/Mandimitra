import cors from 'cors';
import express from 'express';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import marketRoutes from './modules/market/market.routes.js';
import decisionEngineRoutes from './modules/decision-engine/decisionEngine.routes.js';
import lotRoutes from './modules/lots/lot.routes.js';
import offerRoutes from './modules/offers/offer.routes.js';
import transactionRoutes from './modules/transactions/transaction.routes.js';
import grievanceRoutes from './modules/grievances/grievance.routes.js';
import fpoRoutes from './modules/fpo/fpo.routes.js';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mandimitra-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/decision-engine', decisionEngineRoutes);
app.use('/api/lots', lotRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/fpo', fpoRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
