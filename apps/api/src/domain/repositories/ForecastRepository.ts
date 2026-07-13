import type { Forecast, NewForecast } from '../entities/Forecast.js';

export interface ForecastRepository {
  create(data: NewForecast): Promise<Forecast>;
  findAllByBusiness(businessId: string): Promise<Forecast[]>;
  findById(id: string): Promise<Forecast | null>;
}
