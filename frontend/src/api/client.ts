import axios from 'axios';

// The JWT lives in an httpOnly cookie set by the backend. JS never sees it;
// withCredentials makes the browser send it on every request.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api',
  withCredentials: true,
});

// A 401 from a protected endpoint means the session expired → tell the app.
// /auth/* calls handle their own 401s (wrong password, not logged in yet, ...).
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url: string = error.config?.url ?? '';
    if (error.response?.status === 401 && !url.startsWith('/auth/')) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message;
  }
  return 'Something went wrong';
}

export default api;
