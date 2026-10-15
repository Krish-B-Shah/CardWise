import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { NoActiveCardsError } from '../services/recommendationEngine.js';

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) { super(message); }
}

export function requestContext(_req: Request, res: Response, next: NextFunction) {
  const requestId = randomUUID();
  res.locals.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}

// Preserve the existing string error field for dashboard/extension compatibility.
// No request bodies, card labels, SQL statements or database messages are logged.
export function sendApiError(res: Response, error: unknown) {
  const requestId = res.locals.requestId;
  if (error instanceof ZodError) return res.status(400).json({ error: 'Invalid request. Check the submitted values.', code: 'VALIDATION_ERROR', requestId,
    fields: error.issues.map(issue => ({ path: issue.path.join('.'), message: issue.message })) });
  if (error instanceof ApiError) return res.status(error.status).json({ error: error.message, code: error.code, requestId });
  if (error instanceof NoActiveCardsError) return res.status(422).json({ error: error.message, code: 'NO_ACTIVE_CARDS', requestId });
  const databaseCode = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
  if (databaseCode === '23503') return res.status(400).json({ error: 'The referenced record does not exist.', code: 'INVALID_REFERENCE', requestId });
  if (databaseCode === '23505') return res.status(409).json({ error: 'A conflicting record already exists.', code: 'CONFLICT', requestId });
  if (error && typeof error === 'object' && 'type' in error && error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must be valid JSON.', code: 'INVALID_JSON', requestId });
  }
  if (error && typeof error === 'object' && 'type' in error && error.type === 'entity.too.large') return res.status(413).json({ error: 'Request body is too large.', code: 'PAYLOAD_TOO_LARGE', requestId });
  console.error(JSON.stringify({ event: 'api_error', requestId, code: 'INTERNAL_ERROR' }));
  return res.status(500).json({ error: 'Unable to complete the request. Please retry.', code: 'INTERNAL_ERROR', requestId });
}
