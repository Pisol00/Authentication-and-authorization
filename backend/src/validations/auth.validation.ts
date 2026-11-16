import { z } from 'zod';

// Same rules as frontend/src/lib/validation.ts — change both files together.

// bcrypt only uses the first 72 BYTES of a password and silently ignores the rest,
// so longer passwords are rejected instead (a Thai character is 3 bytes).
const PASSWORD_MAX_BYTES = 72;
const utf8Bytes = (value: string) => new TextEncoder().encode(value).length;

export const nameSchema = z
  .string({ error: 'Name is required' })
  .trim()
  .min(1, 'Name is required')
  .max(100, 'Name must be at most 100 characters');

export const emailSchema = z
  .string({ error: 'Email is required' })
  .trim()
  .min(1, 'Email is required')
  .max(254, 'Email is too long')
  .pipe(z.email({ error: 'Invalid email' }));

// For choosing a new password (register, create-admin).
export const newPasswordSchema = z
  .string({ error: 'Password is required' })
  .min(1, 'Password is required')
  .min(6, 'Password must be at least 6 characters')
  .refine((p) => utf8Bytes(p) <= PASSWORD_MAX_BYTES, `Password is too long (max ${PASSWORD_MAX_BYTES} bytes)`);

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: newPasswordSchema,
});

// Login only checks presence: a wrong password is a 401, not a validation error.
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ error: 'Password is required' }).min(1, 'Password is required'),
});
