import type { PublicUser } from './user.js';

// Lets handlers read req.user (set by the requireAuth middleware) with proper typing.
declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
    }
  }
}
