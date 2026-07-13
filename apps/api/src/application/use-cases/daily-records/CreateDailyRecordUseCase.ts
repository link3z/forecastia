import { buildDailyRecordData } from '../../../domain/entities/DailyRecord.js';
import { ConflictError } from '../../../domain/errors/AppError.js';
import type { DailyRecordRepository } from '../../../domain/repositories/DailyRecordRepository.js';
import type { CreateDailyRecordInput } from '../../dtos/daily-record.dto.js';
import type { RecalibrateBusinessMetricsUseCase } from '../metrics/RecalibrateBusinessMetricsUseCase.js';

export class CreateDailyRecordUseCase {
  constructor(
    private readonly dailyRecordRepository: DailyRecordRepository,
    private readonly recalibrateUseCase: RecalibrateBusinessMetricsUseCase,
  ) {}

  async execute(businessId: string, input: CreateDailyRecordInput) {
    const existing = await this.dailyRecordRepository.findByBusinessAndDate(
      businessId,
      input.date,
    );
    if (existing) {
      throw new ConflictError('Ya existe un cierre registrado para esa fecha.');
    }

    const data = buildDailyRecordData({ businessId, ...input });
    const record = await this.dailyRecordRepository.create(data);

    await this.recalibrateUseCase.execute(businessId);

    return record;
  }
}
