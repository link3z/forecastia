import { BcryptPasswordHasher } from './BcryptPasswordHasher.js';
import { JwtTokenService } from './JwtTokenService.js';

export const passwordHasher = new BcryptPasswordHasher();
export const tokenService = new JwtTokenService();
