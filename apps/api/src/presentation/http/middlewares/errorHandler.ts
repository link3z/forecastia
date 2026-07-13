import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { AppError } from '../../../domain/errors/AppError.js';

/**
 * Manejo centralizado de errores. No expone detalles internos ni stack
 * traces al cliente; solo registra en consola para depuración.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Los datos enviados no son válidos.',
        details: err.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    return;
  }

  // eslint-disable-next-line no-console
  console.error('[forecastia-api] error no controlado:', err);
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Ha ocurrido un error interno.' },
  });
}
