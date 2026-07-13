import { buildDailyRecordData } from '../../../domain/entities/DailyRecord.js';
import { ConflictError, NotFoundError } from '../../../domain/errors/AppError.js';
import type { DailyRecordRepository } from '../../../domain/repositories/DailyRecordRepository.js';
import type { UpdateDailyRecordInput } from '../../dtos/daily-record.dto.js';
import type { RecalibrateBusinessMetricsUseCase } from '../metrics/RecalibrateBusinessMetricsUseCase.js';

export class UpdateDailyRecordUseCase {
  constructor(
    private readonly dailyRecordRepository: DailyRecordRepository,
    private readonly recalibrateUseCase: RecalibrateBusinessMetricsUseCase,
  ) {}

  async execute(businessId: string, recordId: string, input: UpdateDailyRecordInput) {
    const existing = await this.dailyRecordRepository.findById(recordId);
    if (!existing || existing.businessId !== businessId) {
      throw new NotFoundError('Cierre diario');
    }

    if (input.date && input.date.getTime() !== existing.date.getTime()) {
      const clashing = await this.dailyRecordRepository.findByBusinessAndDate(
        businessId,
        input.date,
      );
      if (clashing && clashing.id !== recordId) {
        throw new ConflictError('Ya existe otro cierre registrado para esa fecha.');
      }
    }

    const merged = buildDailyRecordData({
      businessId,
      date: input.date ?? existing.date,
      revenue: input.revenue ?? existing.revenue,
      tickets: input.tickets ?? existing.tickets,
      // Si se informa explícitamente caja o tickets, se recalcula el ticket medio;
      // si no, se respeta el valor existente.
      averageTicket:
        input.averageTicket ?? (input.revenue !== undefined || input.tickets !== undefined
          ? null
          : existing.averageTicket),
      weather: input.weather ?? existing.weather,
      tempMax: input.tempMax ?? existing.tempMax,
      tempMin: input.tempMin ?? existing.tempMin,
      rain: input.rain ?? existing.rain,
      wind: input.wind ?? existing.wind,
      event: input.event ?? existing.event,
      campaign: input.campaign ?? existing.campaign,
      socialFollowers: input.socialFollowers ?? existing.socialFollowers,
      observations: input.observations ?? existing.observations,
    });

    const updated = await this.dailyRecordRepository.update(recordId, merged);

    await this.recalibrateUseCase.execute(businessId);

    return updated;
  }
}
