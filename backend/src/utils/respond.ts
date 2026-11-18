// Everything that sends a response lives here, so every endpoint answers the same way.
// Success → the body as-is. Failure → { "message": "..." }. The HTTP status says which one it is.
//
// One function per status code we use, so a controller reads like the response it sends.
// Each returns nothing, so a controller can `return respond.notFound(...)` to stop right there.
import type { Response } from 'express';
import type { ZodError } from 'zod';

function sendError(res: Response, status: number, message: string): void {
  res.status(status).json({ message });
}

export const respond = {
  // 200 OK — respond.ok(res, { user })  →  { "user": { ... } }
  ok(res: Response, body: object): void {
    res.status(200).json(body);
  },

  // 201 Created — something new was made (e.g. a user on sign-up)
  created(res: Response, body: object): void {
    res.status(201).json(body);
  },

  // 204 No Content — success, nothing to send back (e.g. logout)
  noContent(res: Response): void {
    res.status(204).end();
  },

  // 400 Bad Request — the request itself can't be read (e.g. malformed JSON)
  badRequest(res: Response, message: string): void {
    sendError(res, 400, message);
  },

  // 401 Unauthorized — not logged in, session invalid/expired, or wrong email/password
  unauthorized(res: Response, message: string): void {
    sendError(res, 401, message);
  },

  // 403 Forbidden — logged in, but not allowed to do this
  forbidden(res: Response, message: string): void {
    sendError(res, 403, message);
  },

  // 404 Not Found — no such route or record
  notFound(res: Response, message: string): void {
    sendError(res, 404, message);
  },

  // 409 Conflict — clashes with existing data (e.g. email already registered)
  conflict(res: Response, message: string): void {
    sendError(res, 409, message);
  },

  // 422 Unprocessable Content — readable, but fails validation; sends zod's first message
  unprocessable(res: Response, error: ZodError): void {
    sendError(res, 422, error.issues[0]?.message ?? 'Invalid input');
  },

  // 500 Internal Server Error — for catch blocks (something we didn't expect, e.g. the database is down).
  // Logs the real error for us; the client only gets a generic message, never internal details.
  serverError(res: Response, error: unknown): void {
    console.error(error);
    if (res.headersSent) return; // a response already started; we can't send another one
    sendError(res, 500, 'Internal server error');
  },
};
