// Everything that sends a response lives here, so every endpoint answers the same way.
// Success → the body as-is. Failure → { "message": "..." }. The HTTP status says which one it is.
//
// Each function returns nothing, so a controller can `return respond.error(...)` to stop right there.
import type { Response } from 'express';
import type { ZodError } from 'zod';

export const respond = {
  // 200  respond.ok(res, { user })  →  { "user": { ... } }
  ok(res: Response, body: object): void {
    res.status(200).json(body);
  },

  // 201  something was created
  created(res: Response, body: object): void {
    res.status(201).json(body);
  },

  // 204  success, nothing to send back
  noContent(res: Response): void {
    res.status(204).end();
  },

  // 4xx  an expected failure
  //      respond.error(res, 404, 'User not found')  →  404 { "message": "User not found" }
  error(res: Response, status: number, message: string): void {
    res.status(status).json({ message });
  },

  // 400  invalid input; sends the first zod validation message
  invalid(res: Response, error: ZodError): void {
    respond.error(res, 400, error.issues[0]?.message ?? 'Invalid input');
  },

  // 500  for catch blocks (something we didn't expect, e.g. the database is down).
  //      Logs the real error for us; the client only gets a generic message, never internal details.
  unexpected(res: Response, unexpected: unknown): void {
    console.error(unexpected);
    if (res.headersSent) return; // a response already started; we can't send another one
    respond.error(res, 500, 'Internal server error');
  },
};
