// User management rules.
import { userRepository } from '../repositories/user.repository.js';
import { toPublicUser, type PublicUser, type Role } from '../types/user.js';
import { HttpError } from '../utils/http-error.js';

export const userService = {
  async findById(id: string): Promise<PublicUser | undefined> {
    const user = await userRepository.findById(id);
    return user && toPublicUser(user);
  },

  async list(): Promise<PublicUser[]> {
    return (await userRepository.findAll()).map(toPublicUser);
  },

  async changeRole(actorId: string, targetId: string, role: Role): Promise<PublicUser> {
    // Stops the last admin from locking everyone out by demoting themselves.
    if (actorId === targetId) throw new HttpError(400, 'You cannot change your own role');
    const user = await userRepository.updateRole(targetId, role);
    if (!user) throw new HttpError(404, 'User not found');
    return toPublicUser(user);
  },
};
