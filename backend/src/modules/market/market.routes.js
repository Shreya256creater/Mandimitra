import { Router } from 'express';
import { authRequired, requireRoles } from '../../middleware/auth.middleware.js';
import { cropsHandler, ingestHandler, marketsHandler, pricesHandler } from './market.controller.js';

const router = Router();

router.get('/crops', cropsHandler);
router.get('/markets', marketsHandler);
router.get('/prices', pricesHandler);
router.post('/prices', authRequired, requireRoles('ADMIN'), ingestHandler);

export default router;
