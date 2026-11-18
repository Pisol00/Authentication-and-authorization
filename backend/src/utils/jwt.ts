import jwt from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../config/env.js';
import type { PublicUser, Role } from '../types/user.js';

export interface JwtPayload {
  sub: string; // user id (UUID)
  role: Role;
}

export function signToken(user: PublicUser): string {
  const payload: JwtPayload = { sub: user.id, role: user.role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// undefined when the token is invalid or expired (jsonwebtoken throws; we turn that into a value).
export function verifyToken(token: string): JwtPayload | undefined {
  try {
    return jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
  } catch {
    return undefined;
  }
}
