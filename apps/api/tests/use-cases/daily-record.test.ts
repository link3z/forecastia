import { describe, expect, it } from 'vitest';

import { CreateDailyRecordUseCase } from '../../src/application/use-cases/daily-records/CreateDailyRecordUseCase.js';
import { RecalibrateBusinessMetricsUseCase } from '../../src/application/use-cases/metrics/RecalibrateBusinessMetricsUseCase.js';
import { ConflictError, DomainValidationError } from '../../src/domain/errors/AppError.js';
import type { DailyRecord, NewDailyRecord } from '../../src/domain/entities/DailyRecord.js';
import type { DailyRecordRepository } from '../../src/domain/repositories/DailyRecordRepository.js';
import type {
  BusinessMetrics,
  BusinessMetricsSnapshot,
} from '../../src/domain/entities/BusinessMetrics.js';
import type { BusinessMetricsRepository } from '../../src/domain/repositories/BusinessMetricsRepository.js';

class FakeDailyRecordRepository implements DailyRecordRepository {
  records: DailyRecord[] = [];

  async create(data: NewDailyRecord): Promise<DailyRecord> {
    const record: DailyRecord = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    this.records.push(record);
    return record;
  }

  async update(id: string, data: Partial<NewDailyRecord>): Promise<DailyRecord> {
    const idx = this.records.findIndex((r) => r.id === id);
    this.records[idx] = { ...this.records[idx], ...data, updatedAt: new Date() };
    return this.records[idx];
  }

  async findById(id: string): Promise<DailyRecord | null> {
    return this.records.find((r) => r.id === id) ?? null;
  }

  async findByBusinessAndDate(businessId: string, date: Date): Promise<DailyRecord | null> {
    return (
      this.records.find(
        (r) => r.businessId === businessId && r.date.getTime() === date.getTime(),
      ) ?? null
    );
  }

  async findAllByBusiness(businessId: string): Promise<DailyRecord[]> {
    return this.records.filter((r) => r.businessId === businessId);
  }
}

class FakeBusinessMetricsRepository implements BusinessMetricsRepository {
  metrics: Record<string, BusinessMetrics> = {};

  async findByBusinessId(businessId: string): Promise<BusinessMetrics | null> {
    return this.metrics[businessId] ?? null;
  }

  async upsert(businessId: string, snapshot: BusinessMetricsSnapshot): Promise<BusinessMetrics> {
    const metric: BusinessMetrics = {
      id: this.metrics[businessId]?.id ?? crypto.randomUUID(),
      updatedAt: new Date(),
      ...snapshot,
    };
    this.metrics[businessId] = metric;
    return metric;
  }
}

describe('CreateDailyRecordUseCase', () => {
  it('crea un cierre, calcula el ticket medio y recalibra las métricas', async () => {
    const dailyRecordRepo = new FakeDailyRecordRepository();
    const metricsRepo = new FakeBusinessMetricsRepository();
    const recalibrate = new RecalibrateBusinessMetricsUseCase(dailyRecordRepo, metricsRepo);
    const useCase = new CreateDailyRecordUseCase(dailyRecordRepo, recalibrate);

    const record = await useCase.execute('business-1', {
      date: new Date('2026-06-01T00:00:00.000Z'),
      revenue: 200,
      tickets: 20,
    });

    expect(record.averageTicket).toBe(10);
    const metrics = await metricsRepo.findByBusinessId('business-1');
    expect(metrics?.totalRevenue).toBe(200);
    expect(metrics?.recordsCount).toBe(1);
  });

  it('rechaza dos cierres en la misma fecha para el mismo negocio', async () => {
    const dailyRecordRepo = new FakeDailyRecordRepository();
    const metricsRepo = new FakeBusinessMetricsRepository();
    const useCase = new CreateDailyRecordUseCase(
      dailyRecordRepo,
      new RecalibrateBusinessMetricsUseCase(dailyRecordRepo, metricsRepo),
    );

    const date = new Date('2026-06-01T00:00:00.000Z');
    await useCase.execute('business-1', { date, revenue: 100, tickets: 10 });

    await expect(
      useCase.execute('business-1', { date, revenue: 50, tickets: 5 }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('rechaza caja negativa', async () => {
    const dailyRecordRepo = new FakeDailyRecordRepository();
    const metricsRepo = new FakeBusinessMetricsRepository();
    const useCase = new CreateDailyRecordUseCase(
      dailyRecordRepo,
      new RecalibrateBusinessMetricsUseCase(dailyRecordRepo, metricsRepo),
    );

    await expect(
      useCase.execute('business-1', {
        date: new Date('2026-06-01T00:00:00.000Z'),
        revenue: -10,
        tickets: 5,
      }),
    ).rejects.toBeInstanceOf(DomainValidationError);
  });
});
