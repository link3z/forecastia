import jwt, { type SignOptions } from 'jsonwebtoken';

import { UnauthorizedError } from '../../domain/errors/AppError.js';
import type { TokenPayload, TokenService } from '../../application/ports/TokenService.js';

export class JwtTokenService implements TokenService {
  private readonly secret = process.env.JWT_SECRET ?? 'forecastia-dev-secret';
  private readonly expiresIn = (process.env.JWT_EXPIRES_IN ??
    '1d') as SignOptions['expiresIn'];

  sign(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verify(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret);
      if (typeof decoded === 'string' || !('userId' in decoded)) {
        throw new Error('Token sin userId.');
      }
      return { userId: (decoded as { userId: string }).userId };
    } catch {
      throw new UnauthorizedError('Token inválido o expirado.');
    }
  }
}
