import type { DailyRecord, NewDailyRecord } from '../entities/DailyRecord.js';

export interface DailyRecordRepository {
  create(data: NewDailyRecord): Promise<DailyRecord>;
  update(id: string, data: Partial<NewDailyRecord>): Promise<DailyRecord>;
  findById(id: string): Promise<DailyRecord | null>;
  findByBusinessAndDate(businessId: string, date: Date): Promise<DailyRecord | null>;
  findAllByBusiness(businessId: string): Promise<DailyRecord[]>;
}
