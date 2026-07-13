import { NotFoundError } from '../../../domain/errors/AppError.js';
import type { BusinessRepository } from '../../../domain/repositories/BusinessRepository.js';
import type { UpdateBusinessInput } from '../../dtos/business.dto.js';

export class UpdateBusinessUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(userId: string, businessId: string, input: UpdateBusinessInput) {
    const business = await this.businessRepository.findById(businessId);
    if (!business || business.userId !== userId) {
      throw new NotFoundError('Negocio');
    }

    return this.businessRepository.update(businessId, {
      ...input,
      seasonStart: input.seasonStart ?? undefined,
      seasonEnd: input.seasonEnd ?? undefined,
    });
  }
}
