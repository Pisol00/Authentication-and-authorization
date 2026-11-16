import api from './client';
import type { Role, User } from '@/types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: User }>('/auth/login', { email, password }).then((r) => r.data.user),
  register: (name: string, email: string, password: string) =>
    api.post<{ user: User }>('/auth/register', { name, email, password }).then((r) => r.data.user),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<{ user: User }>('/auth/me').then((r) => r.data.user),
};

export const usersApi = {
  list: () => api.get<{ users: User[] }>('/users').then((r) => r.data.users),
  updateRole: (id: string, role: Role) =>
    api.patch<{ user: User }>(`/users/${id}/role`, { role }).then((r) => r.data.user),
};
