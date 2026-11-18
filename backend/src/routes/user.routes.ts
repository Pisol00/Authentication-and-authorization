import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// Every /users route: must be logged in AND be an admin.
router.use(requireAuth('admin'));

router.get('/', userController.list);
router.patch('/:id/role', userController.updateRole);

export default router;
