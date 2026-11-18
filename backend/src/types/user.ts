export type Role = 'user' | 'admin';
export const ROLES = ['user', 'admin'] as const satisfies readonly Role[];

// A row of the users table (camelCase).
export interface User {
  id: string; // always a UUID
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date; // sent to the client as an ISO string (JSON)
}

// What the API is allowed to return: never the password hash.
export type PublicUser = Omit<User, 'passwordHash'>;

export function toPublicUser({ passwordHash: _omit, ...rest }: User): PublicUser {
  return rest;
}
