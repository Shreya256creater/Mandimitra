import { Router } from 'express';
import { authRequired, requireRoles } from '../../middleware/auth.middleware.js';
import { addMemberHandler, createHandler, dashboardHandler, listHandler } from './fpo.controller.js';

const router = Router();

router.use(authRequired);
router.get('/', listHandler);
router.post('/', requireRoles('FPO', 'ADMIN'), createHandler);
router.get('/:id', dashboardHandler);
router.post('/:id/members', requireRoles('FPO', 'ADMIN'), addMemberHandler);

export default router;
