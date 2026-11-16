import { z } from 'zod';

// Same rules as backend/src/validations/auth.validation.ts — change both files together.
// The backend check is the one that counts; this one only gives faster, nicer feedback.

// bcrypt only uses the first 72 BYTES of a password (a Thai character is 3 bytes).
const PASSWORD_MAX_BYTES = 72;
const utf8Bytes = (value: string) => new TextEncoder().encode(value).length;

const nameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(100, 'Name must be at most 100 characters');

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .max(254, 'Email is too long')
  .pipe(z.email({ error: 'Invalid email' }));

const newPasswordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(6, 'Password must be at least 6 characters')
  .refine((p) => utf8Bytes(p) <= PASSWORD_MAX_BYTES, `Password is too long (max ${PASSWORD_MAX_BYTES} bytes)`);

export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerFormSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

// Runs a schema and returns the first error message per field ({} when valid).
export function getFieldErrors<T extends z.ZodType>(schema: T, values: z.input<T>): FieldErrors<z.input<T>> {
  const result = schema.safeParse(values);
  if (result.success) return {};
  const errors: FieldErrors<z.input<T>> = {};
  for (const [field, messages] of Object.entries(z.flattenError(result.error).fieldErrors)) {
    const first = (messages as string[] | undefined)?.[0];
    if (first) errors[field as keyof z.input<T>] = first;
  }
  return errors;
}
