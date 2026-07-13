import { NotFoundError } from '../../../domain/errors/AppError.js';
import type { BusinessRepository } from '../../../domain/repositories/BusinessRepository.js';
import type { BusinessMetricsRepository } from '../../../domain/repositories/BusinessMetricsRepository.js';
import type { DailyRecordRepository } from '../../../domain/repositories/DailyRecordRepository.js';
import type { ForecastRepository } from '../../../domain/repositories/ForecastRepository.js';
import { JsonExporter } from '../../../infrastructure/exporters/JsonExporter.js';

export class ExportJsonUseCase {
  private readonly exporter = new JsonExporter();

  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly dailyRecordRepository: DailyRecordRepository,
    private readonly businessMetricsRepository: BusinessMetricsRepository,
    private readonly forecastRepository: ForecastRepository,
  ) {}

  async execute(
    userId: string,
    businessId: string,
  ): Promise<{ content: string; filename: string }> {
    const business = await this.businessRepository.findById(businessId);
    if (!business || business.userId !== userId) throw new NotFoundError('Negocio');

    const [records, metrics, forecasts] = await Promise.all([
      this.dailyRecordRepository.findAllByBusiness(businessId),
      this.businessMetricsRepository.findByBusinessId(businessId),
      this.forecastRepository.findAllByBusiness(businessId),
    ]);

    const slug = slugify(business.name);
    const today = new Date().toISOString().slice(0, 10);

    return {
      content: this.exporter.export(business, records, metrics, forecasts),
      filename: `${slug}-datos-${today}.json`,
    };
  }
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
