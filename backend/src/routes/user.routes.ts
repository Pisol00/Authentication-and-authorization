import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { updateRoleSchema, userIdParamSchema } from '../validations/user.validation.js';

const router = Router();

// Every /users route: must be logged in AND be an admin.
router.use(authenticate, authorize('admin'));

router.get('/', userController.list);
router.patch('/:id/role', validate({ params: userIdParamSchema, body: updateRoleSchema }), userController.updateRole);

export default router;
