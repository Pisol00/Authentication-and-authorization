// Translates HTTP ↔ service calls: validates input, turns service results into status codes,
// sets cookies. The catch is for anything unexpected (e.g. database down).
import type { Request, Response } from 'express';
import { AUTH_COOKIE, authCookieOptions, JWT_EXPIRES_IN } from '../config/env.js';
import { authService } from '../services/auth.service.js';
import type { PublicUser } from '../types/user.js';
import { respond } from '../utils/respond.js';
import { signToken } from '../utils/jwt.js';
import { loginSchema, registerSchema } from '../validations/auth.validation.js';

// The token goes only into an httpOnly cookie, never into the response body.
function setAuthCookie(res: Response, user: PublicUser): void {
  res.cookie(AUTH_COOKIE, signToken(user), { ...authCookieOptions, maxAge: JWT_EXPIRES_IN * 1000 });
}

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const input = registerSchema.safeParse(req.body ?? {}); // Express 5 leaves req.body undefined without a body
      if (!input.success) return respond.unprocessable(res, input.error);

      const user = await authService.register(input.data);
      if (!user) return respond.conflict(res, 'Email already registered');

      setAuthCookie(res, user);
      respond.created(res, { user });
    } catch (unexpected) {
      respond.serverError(res, unexpected);
    }
  },

  async login(req: Request, res: Response) {
    try {
      const input = loginSchema.safeParse(req.body ?? {});
      if (!input.success) return respond.unprocessable(res, input.error);

      const user = await authService.login(input.data);
      if (!user) return respond.unauthorized(res, 'Invalid email or password');

      setAuthCookie(res, user);
      respond.ok(res, { user });
    } catch (unexpected) {
      respond.serverError(res, unexpected);
    }
  },

  // No auth required, so logout works even with an expired token.
  // Stateless JWT: the token itself stays valid until it expires; the browser just drops it.
  logout(_req: Request, res: Response) {
    try {
      res.clearCookie(AUTH_COOKIE, authCookieOptions);
      respond.noContent(res);
    } catch (unexpected) {
      respond.serverError(res, unexpected);
    }
  },

  me(req: Request, res: Response) {
    try {
      respond.ok(res, { user: req.user });
    } catch (unexpected) {
      respond.serverError(res, unexpected);
    }
  },
};
