// Sign-up and login rules. Knows nothing about HTTP requests, responses or cookies.
import bcrypt from 'bcryptjs';
import { EmailTakenError, userRepository } from '../repositories/user.repository.js';
import { toPublicUser, type PublicUser } from '../types/user.js';
import { HttpError } from '../utils/http-error.js';

const BCRYPT_ROUNDS = 10;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export const authService = {
  async register(input: { name: string; email: string; password: string }): Promise<PublicUser> {
    try {
      const user = await userRepository.create({
        name: input.name,
        email: input.email,
        passwordHash: await hashPassword(input.password),
        role: 'user', // public sign-up is always "user" — never trust a role from the client
      });
      return toPublicUser(user);
    } catch (err) {
      if (err instanceof EmailTakenError) throw new HttpError(409, err.message);
      throw err;
    }
  },

  async login(input: { email: string; password: string }): Promise<PublicUser> {
    const user = await userRepository.findByEmail(input.email);
    const ok = user && (await bcrypt.compare(input.password, user.passwordHash));
    // Same message for "no such email" and "wrong password" → doesn't reveal which emails exist.
    if (!user || !ok) throw new HttpError(401, 'Invalid email or password');
    return toPublicUser(user);
  },
};
