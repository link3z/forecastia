import { NotFoundError } from '../../../domain/errors/AppError.js';
import type { BusinessRepository } from '../../../domain/repositories/BusinessRepository.js';
import type { PredictiveVariableConfigRepository } from '../../../domain/repositories/PredictiveVariableConfigRepository.js';

/**
 * Lectura de la configuración de variables predictivas de un negocio (CU-002).
 * Complementa a UpdatePredictiveVariablesUseCase, que solo escribe: el
 * frontend necesita poder cargar los valores actuales antes de editarlos.
 */
export class GetPredictiveVariablesUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly predictiveVariableConfigRepository: PredictiveVariableConfigRepository,
  ) {}

  async execute(userId: string, businessId: string) {
    const business = await this.businessRepository.findById(businessId);
    if (!business || business.userId !== userId) {
      throw new NotFoundError('Negocio');
    }

    const config = await this.predictiveVariableConfigRepository.findByBusinessId(businessId);
    if (!config) {
      throw new NotFoundError('Configuración de variables predictivas');
    }
    return config;
  }
}
