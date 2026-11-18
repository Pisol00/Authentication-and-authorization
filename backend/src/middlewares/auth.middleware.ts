// Every rejection is `return respond.unauthorized(...)` / `forbidden(...)`: the `return` stops next() from running after
// the response was already sent.
import type { NextFunction, Request, Response } from 'express';
import { AUTH_COOKIE } from '../config/env.js';
import { userService } from '../services/user.service.js';
import type { Role } from '../types/user.js';
import { respond } from '../utils/respond.js';
import { verifyToken } from '../utils/jwt.js';

// "Must be logged in", and optionally "with one of these roles". Sets req.user.
//   requireAuth()         → any logged-in user
//   requireAuth('admin')  → logged in AND an admin
// Checks in order: logged in? (401) → right role? (403)
export function requireAuth(...roles: Role[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Who is making this request? The JWT lives in the httpOnly cookie.
      const token: unknown = req.cookies?.[AUTH_COOKIE];
      if (typeof token !== 'string' || !token) return respond.unauthorized(res, 'Not logged in');

      const payload = verifyToken(token);
      if (!payload) return respond.unauthorized(res, 'Invalid or expired session');

      const user = await userService.findById(payload.sub);
      if (!user) return respond.unauthorized(res, 'User no longer exists');

      // The role comes from the database, not from the token.
      if (roles.length > 0 && !roles.includes(user.role)) {
        return respond.forbidden(res, 'Forbidden: insufficient role');
      }

      req.user = user;
      next();
    } catch (unexpected) {
      respond.serverError(res, unexpected);
    }
  };
}
