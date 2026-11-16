import type { NextFunction, Request, Response } from 'express';
import { AUTH_COOKIE } from '../config/env.js';
import { userService } from '../services/user.service.js';
import type { Role } from '../types/user.js';
import { HttpError } from '../utils/http-error.js';
import { verifyToken, type JwtPayload } from '../utils/jwt.js';

// Authentication: who are you? Verifies the JWT from the httpOnly cookie and loads the user.
export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token: unknown = req.cookies?.[AUTH_COOKIE];
  if (typeof token !== 'string' || !token) throw new HttpError(401, 'Not logged in');

  let payload: JwtPayload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new HttpError(401, 'Invalid or expired session');
  }

  const user = await userService.findById(payload.sub);
  if (!user) throw new HttpError(401, 'User no longer exists');
  req.user = user; // role comes from the database, not from the token
  next();
}

// Authorization: are you allowed? Use after authenticate.
export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new HttpError(403, 'Forbidden: insufficient role');
    }
    next();
  };
}
