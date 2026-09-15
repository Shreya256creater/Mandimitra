import { Router } from 'express';
import { authRequired, requireRoles } from '../../middleware/auth.middleware.js';
import { createHandler, getHandler, listHandler } from './lot.controller.js';

const router = Router();

router.use(authRequired);
router.get('/', listHandler);
router.post('/', requireRoles('FARMER', 'FPO', 'ADMIN'), createHandler);
router.get('/:id', getHandler);

export default router;
