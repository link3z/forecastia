import { NotFoundError } from '../../../domain/errors/AppError.js';
import type { BusinessRepository } from '../../../domain/repositories/BusinessRepository.js';
import type { PredictiveVariableConfigRepository } from '../../../domain/repositories/PredictiveVariableConfigRepository.js';
import type { UpdatePredictiveVariablesInput } from '../../dtos/business.dto.js';

export class UpdatePredictiveVariablesUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly predictiveVariableConfigRepository: PredictiveVariableConfigRepository,
  ) {}

  async execute(userId: string, businessId: string, input: UpdatePredictiveVariablesInput) {
    const business = await this.businessRepository.findById(businessId);
    if (!business || business.userId !== userId) {
      throw new NotFoundError('Negocio');
    }

    return this.predictiveVariableConfigRepository.update(businessId, input);
  }
}
