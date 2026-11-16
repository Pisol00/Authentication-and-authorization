import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/http-error.js';

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ message: 'Not found' });
}

// Last middleware: every thrown error ends up here. Express 5 also forwards rejected promises.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }
  // Errors from express.json() (e.g. malformed JSON) carry a 4xx status.
  const status = (err as { status?: number }).status;
  if (typeof status === 'number' && status >= 400 && status < 500) {
    return res.status(status).json({ message: 'Invalid request body' });
  }
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
}
