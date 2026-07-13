import { ConflictError } from '../../../domain/errors/AppError.js';
import type { UserRepository } from '../../../domain/repositories/UserRepository.js';
import type { PasswordHasher } from '../../ports/PasswordHasher.js';
import type { RegisterInput } from '../../dtos/auth.dto.js';

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: RegisterInput) {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('Ya existe un usuario registrado con ese email.');
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    return user;
  }
}
