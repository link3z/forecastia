import { NotFoundError } from '../../../domain/errors/AppError.js';
import type { UserRepository } from '../../../domain/repositories/UserRepository.js';

export class GetCurrentUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuario');
    }
    return user;
  }
}
