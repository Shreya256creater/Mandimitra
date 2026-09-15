import { Router } from 'express';
import { authRequired } from '../../middleware/auth.middleware.js';
import { loginHandler, meHandler, registerHandler } from './auth.controller.js';

const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.get('/me', authRequired, meHandler);

export default router;
