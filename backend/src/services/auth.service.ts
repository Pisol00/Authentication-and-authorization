// Sign-up and login rules. Knows nothing about HTTP: it returns data, and the controller
// decides what status code that means.
import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository.js';
import { toPublicUser, type PublicUser } from '../types/user.js';

const BCRYPT_ROUNDS = 10;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export const authService = {
  // The new user, or undefined when the email is already registered.
  async register(input: { name: string; email: string; password: string }): Promise<PublicUser | undefined> {
    const created = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      role: 'user', // public sign-up is always "user" — never trust a role from the client
    });
    return created && toPublicUser(created);
  },

  // The user, or undefined when the email doesn't exist OR the password is wrong
  // (one answer for both, so a caller can't tell which emails exist).
  async login(input: { email: string; password: string }): Promise<PublicUser | undefined> {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) return undefined;
    return toPublicUser(user);
  },
};
