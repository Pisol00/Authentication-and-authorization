// Translates HTTP ↔ service calls. Cookies live here because they are an HTTP concern.
import type { Request, Response } from 'express';
import { AUTH_COOKIE, authCookieOptions, JWT_EXPIRES_IN } from '../config/env.js';
import { authService } from '../services/auth.service.js';
import type { PublicUser } from '../types/user.js';
import { signToken } from '../utils/jwt.js';
import type { loginSchema, registerSchema } from '../validations/auth.validation.js';
import type { z } from 'zod';

// The token goes only into an httpOnly cookie, never into the response body.
function setAuthCookie(res: Response, user: PublicUser): void {
  res.cookie(AUTH_COOKIE, signToken(user), { ...authCookieOptions, maxAge: JWT_EXPIRES_IN * 1000 });
}

export const authController = {
  async register(req: Request, res: Response) {
    const user = await authService.register(req.body as z.infer<typeof registerSchema>);
    setAuthCookie(res, user);
    res.status(201).json({ user });
  },

  async login(req: Request, res: Response) {
    const user = await authService.login(req.body as z.infer<typeof loginSchema>);
    setAuthCookie(res, user);
    res.json({ user });
  },

  // No auth required, so logout works even with an expired token.
  // Stateless JWT: the token itself stays valid until it expires; the browser just drops it.
  logout(_req: Request, res: Response) {
    res.clearCookie(AUTH_COOKIE, authCookieOptions);
    res.status(204).end();
  },

  me(req: Request, res: Response) {
    res.json({ user: req.user });
  },
};
