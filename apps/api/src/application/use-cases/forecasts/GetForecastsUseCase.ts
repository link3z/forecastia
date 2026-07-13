import { NotFoundError } from '../../../domain/errors/AppError.js';
import type { Forecast } from '../../../domain/entities/Forecast.js';
import type { BusinessRepository } from '../../../domain/repositories/BusinessRepository.js';
import type { ForecastRepository } from '../../../domain/repositories/ForecastRepository.js';

export class GetForecastsUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly forecastRepository: ForecastRepository,
  ) {}

  async execute(userId: string, businessId: string): Promise<Forecast[]> {
    const business = await this.businessRepository.findById(businessId);
    if (!business || business.userId !== userId) {
      throw new NotFoundError('Negocio');
    }
    return this.forecastRepository.findAllByBusiness(businessId);
  }
}
