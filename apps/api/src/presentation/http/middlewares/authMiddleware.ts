import type { NextFunction, Request, Response } from 'express';

import { UnauthorizedError } from '../../../domain/errors/AppError.js';
import { tokenService } from '../../../infrastructure/auth/index.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Falta el token de autenticación.');
  }

  const token = header.slice('Bearer '.length);
  const payload = tokenService.verify(token);
  req.userId = payload.userId;
  next();
}
