import { UnauthorizedError } from '../../../domain/errors/AppError.js';
import type { UserRepository } from '../../../domain/repositories/UserRepository.js';
import type { PasswordHasher } from '../../ports/PasswordHasher.js';
import type { TokenService } from '../../ports/TokenService.js';
import type { LoginInput } from '../../dtos/auth.dto.js';

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: LoginInput) {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas.');
    }

    const isValid = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Credenciales inválidas.');
    }

    const token = this.tokenService.sign({ userId: user.id });
    return { token, user };
  }
}
