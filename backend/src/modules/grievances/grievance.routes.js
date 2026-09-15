import { Router } from 'express';
import { authRequired, requireRoles } from '../../middleware/auth.middleware.js';
import { createHandler, listHandler, updateHandler } from './grievance.controller.js';

const router = Router();

router.use(authRequired);
router.get('/', listHandler);
router.post('/', createHandler);
router.patch('/:id', requireRoles('ADMIN'), updateHandler);

export default router;
