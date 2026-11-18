import { Router } from 'express';
import { respond } from '../utils/respond.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  respond.ok(res, { ok: true });
});
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
