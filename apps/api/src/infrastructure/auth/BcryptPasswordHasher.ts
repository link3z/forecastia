import bcrypt from 'bcrypt';

import type { PasswordHasher } from '../../application/ports/PasswordHasher.js';

export class BcryptPasswordHasher implements PasswordHasher {
  private readonly saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
