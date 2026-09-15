import { Router } from 'express';
import { authRequired, requireRoles } from '../../middleware/auth.middleware.js';
import { createHandler, listHandler } from './offer.controller.js';

const router = Router();

router.get('/', authRequired, listHandler);
router.post('/', authRequired, requireRoles('BUYER', 'ADMIN'), createHandler);

export default router;
