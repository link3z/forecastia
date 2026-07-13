import { RecalibrationCalculator } from '../../../domain/services/RecalibrationCalculator.js';
import type { BusinessMetricsRepository } from '../../../domain/repositories/BusinessMetricsRepository.js';
import type { DailyRecordRepository } from '../../../domain/repositories/DailyRecordRepository.js';

/**
 * CU-011 — Recalibrar modelo con nuevos cierres.
 * Se invoca tras crear, importar o editar un cierre diario para recalcular
 * medias, tendencias, desviaciones y métricas principales del negocio.
 */
export class RecalibrateBusinessMetricsUseCase {
  constructor(
    private readonly dailyRecordRepository: DailyRecordRepository,
    private readonly businessMetricsRepository: BusinessMetricsRepository,
  ) {}

  async execute(businessId: string) {
    const records = await this.dailyRecordRepository.findAllByBusiness(businessId);
    const snapshot = RecalibrationCalculator.computeMetrics(businessId, records);
    return this.businessMetricsRepository.upsert(businessId, snapshot);
  }
}
