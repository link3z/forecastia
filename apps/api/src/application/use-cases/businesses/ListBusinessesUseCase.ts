import type { BusinessRepository } from '../../../domain/repositories/BusinessRepository.js';

export class ListBusinessesUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(userId: string) {
    return this.businessRepository.findAllByUser(userId);
  }
}
