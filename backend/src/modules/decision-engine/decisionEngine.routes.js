import { Router } from 'express';
import { optionalAuth } from '../../middleware/auth.middleware.js';
import { evaluate } from './decisionEngine.controller.js';

const router = Router();

router.post('/evaluate', optionalAuth, evaluate);

export default router;
