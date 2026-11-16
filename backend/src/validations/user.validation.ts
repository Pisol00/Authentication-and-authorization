import { z } from 'zod';
import { ROLES } from '../types/user.js';

export const userIdParamSchema = z.object({
  id: z.uuid({ error: 'Invalid user id' }),
});

export const updateRoleSchema = z.object({
  role: z.enum(ROLES, { error: 'Role must be "user" or "admin"' }),
});
