// Validates input, turns service results into status codes. The catch is for anything
// unexpected (e.g. database down).
import type { Request, Response } from 'express';
import { userService } from '../services/user.service.js';
import { respond } from '../utils/respond.js';
import { updateRoleSchema, userIdParamSchema } from '../validations/user.validation.js';

export const userController = {
  async list(_req: Request, res: Response) {
    try {
      respond.ok(res, { users: await userService.list() });
    } catch (unexpected) {
      respond.serverError(res, unexpected);
    }
  },

  async updateRole(req: Request, res: Response) {
    try {
      const params = userIdParamSchema.safeParse(req.params);
      if (!params.success) return respond.unprocessable(res, params.error);
      const body = updateRoleSchema.safeParse(req.body ?? {});
      if (!body.success) return respond.unprocessable(res, body.error);

      // Stops the last admin from locking everyone out by demoting themselves.
      if (params.data.id === req.user!.id) return respond.forbidden(res, 'You cannot change your own role');

      const user = await userService.changeRole(params.data.id, body.data.role);
      if (!user) return respond.notFound(res, 'User not found');

      respond.ok(res, { user });
    } catch (unexpected) {
      respond.serverError(res, unexpected);
    }
  },
};
