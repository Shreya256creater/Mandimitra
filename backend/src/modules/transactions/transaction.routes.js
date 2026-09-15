import { Router } from 'express';
import { authRequired } from '../../middleware/auth.middleware.js';
import { createHandler, listHandler, updateHandler } from './transaction.controller.js';

const router = Router();

router.use(authRequired);
router.get('/', listHandler);
router.post('/', createHandler);
router.patch('/:id', updateHandler);

export default router;
