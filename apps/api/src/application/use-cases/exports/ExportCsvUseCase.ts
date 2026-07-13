import { NotFoundError } from '../../../domain/errors/AppError.js';
import type { BusinessRepository } from '../../../domain/repositories/BusinessRepository.js';
import type { BusinessMetricsRepository } from '../../../domain/repositories/BusinessMetricsRepository.js';
import type { DailyRecordRepository } from '../../../domain/repositories/DailyRecordRepository.js';
import { CsvExporter } from '../../../infrastructure/exporters/CsvExporter.js';

export class ExportCsvUseCase {
  private readonly exporter = new CsvExporter();

  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly dailyRecordRepository: DailyRecordRepository,
    private readonly businessMetricsRepository: BusinessMetricsRepository,
  ) {}

  async execute(
    userId: string,
    businessId: string,
    target: 'records' | 'metrics',
  ): Promise<{ content: string; filename: string }> {
    const business = await this.businessRepository.findById(businessId);
    if (!business || business.userId !== userId) throw new NotFoundError('Negocio');

    const slug = slugify(business.name);
    const today = new Date().toISOString().slice(0, 10);

    if (target === 'metrics') {
      const metrics = await this.businessMetricsRepository.findByBusinessId(businessId);
      if (!metrics) throw new NotFoundError('Métricas');
      return {
        content: this.exporter.exportMetrics(metrics),
        filename: `${slug}-metricas-${today}.csv`,
      };
    }

    const records = await this.dailyRecordRepository.findAllByBusiness(businessId);
    return {
      content: this.exporter.exportDailyRecords(records),
      filename: `${slug}-cierres-${today}.csv`,
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
