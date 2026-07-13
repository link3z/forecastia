import { DEFAULT_PREDICTIVE_VARIABLE_CONFIG } from '../../../domain/entities/PredictiveVariableConfig.js';
import type { BusinessRepository } from '../../../domain/repositories/BusinessRepository.js';
import type { PredictiveVariableConfigRepository } from '../../../domain/repositories/PredictiveVariableConfigRepository.js';
import type { CreateBusinessInput } from '../../dtos/business.dto.js';

export class CreateBusinessUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly predictiveVariableConfigRepository: PredictiveVariableConfigRepository,
  ) {}

  async execute(userId: string, input: CreateBusinessInput) {
    const business = await this.businessRepository.create({
      userId,
      name: input.name,
      type: input.type,
      location: input.location,
      currency: input.currency,
      startDate: input.startDate,
      isSeasonal: input.isSeasonal,
      seasonStart: input.seasonStart ?? null,
      seasonEnd: input.seasonEnd ?? null,
      thresholds: input.thresholds,
    });

    const predictiveVariableConfig = await this.predictiveVariableConfigRepository.create({
      businessId: business.id,
      ...DEFAULT_PREDICTIVE_VARIABLE_CONFIG,
    });

    return { business, predictiveVariableConfig };
  }
}
