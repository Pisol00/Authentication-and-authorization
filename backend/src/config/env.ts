import type { CookieOptions } from 'express';

export const PORT = Number(process.env.PORT) || 4000;
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
export const JWT_EXPIRES_IN = Number(process.env.JWT_EXPIRES_IN) || 3600; // seconds
export const DATABASE_URL =
  process.env.DATABASE_URL || 'postgres://postgres:1234@localhost:5432/authsystem';
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const isProd = process.env.NODE_ENV === 'production';

export const AUTH_COOKIE = 'token';
export const authCookieOptions: CookieOptions = {
  httpOnly: true,   // JS can't read it → an XSS bug can't steal the token
  secure: isProd,   // HTTPS only in production (localhost dev is plain http)
  sameSite: 'lax',  // not sent on cross-site POST/PATCH → basic CSRF protection
  path: '/',
};

