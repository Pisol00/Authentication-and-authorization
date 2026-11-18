// User management. Returns data; the controller decides what status code that means.
import { userRepository } from '../repositories/user.repository.js';
import { toPublicUser, type PublicUser, type Role } from '../types/user.js';

export const userService = {
  async findById(id: string): Promise<PublicUser | undefined> {
    const user = await userRepository.findById(id);
    return user && toPublicUser(user);
  },

  async list(): Promise<PublicUser[]> {
    return (await userRepository.findAll()).map(toPublicUser);
  },

  // The updated user, or undefined when no user has this id.
  async changeRole(id: string, role: Role): Promise<PublicUser | undefined> {
    const user = await userRepository.updateRole(id, role);
    return user && toPublicUser(user);
  },
};
