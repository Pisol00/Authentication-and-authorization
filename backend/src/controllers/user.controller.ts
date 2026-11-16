import type { Request, Response } from 'express';
import type { z } from 'zod';
import { userService } from '../services/user.service.js';
import type { updateRoleSchema } from '../validations/user.validation.js';

export const userController = {
  async list(_req: Request, res: Response) {
    res.json({ users: await userService.list() });
  },

  async updateRole(req: Request, res: Response) {
    const { role } = req.body as z.infer<typeof updateRoleSchema>;
    const user = await userService.changeRole(req.user!.id, req.params.id as string, role);
    res.json({ user });
  },
};
