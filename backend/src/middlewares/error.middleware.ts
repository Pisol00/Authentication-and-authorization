import type { NextFunction, Request, Response } from 'express';
import { respond } from '../utils/respond.js';

// After all routes: no route matched.
export function notFound(_req: Request, res: Response) {
  respond.error(res, 404, 'Not found');
}

// Last resort for errors thrown before a controller runs, e.g. express.json() on a malformed body.
// Without it Express answers with an HTML page (and a stack trace in development).
// The 4 parameters are what tell Express this is an error handler.
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if ((error as { type?: string }).type === 'entity.parse.failed') {
    return respond.error(res, 400, 'Invalid request body');
  }
  respond.unexpected(res, error);
}
