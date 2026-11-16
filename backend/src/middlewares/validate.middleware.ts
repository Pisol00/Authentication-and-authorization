import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { HttpError } from '../utils/http-error.js';

interface Schemas {
  body?: ZodType;
  params?: ZodType;
}

// Rejects the request with 400 (first validation message) before it reaches the controller.
// On success req.body is replaced with the parsed value (e.g. trimmed strings).
export function validate(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) throw new HttpError(400, result.error.issues[0]!.message);
    }
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body ?? {});
      if (!result.success) throw new HttpError(400, result.error.issues[0]!.message);
      req.body = result.data;
    }
    next();
  };
}
