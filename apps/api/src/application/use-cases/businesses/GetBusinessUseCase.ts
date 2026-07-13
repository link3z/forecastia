import { NotFoundError } from '../../../domain/errors/AppError.js';
import type { BusinessRepository } from '../../../domain/repositories/BusinessRepository.js';

export class GetBusinessUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(userId: string, businessId: string) {
    const business = await this.businessRepository.findById(businessId);
    if (!business || business.userId !== userId) {
      throw new NotFoundError('Negocio');
    }
    return business;
  }
}
