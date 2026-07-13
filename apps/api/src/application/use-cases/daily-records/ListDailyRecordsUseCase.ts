import type { DailyRecordRepository } from '../../../domain/repositories/DailyRecordRepository.js';

export class ListDailyRecordsUseCase {
  constructor(private readonly dailyRecordRepository: DailyRecordRepository) {}

  async execute(businessId: string) {
    const records = await this.dailyRecordRepository.findAllByBusiness(businessId);
    return [...records].sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}
