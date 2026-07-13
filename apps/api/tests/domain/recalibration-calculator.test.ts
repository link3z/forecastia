import { describe, expect, it } from 'vitest';

import { RecalibrationCalculator } from '../../src/domain/services/RecalibrationCalculator.js';
import type { DailyRecord } from '../../src/domain/entities/DailyRecord.js';

function makeRecord(overrides: Partial<DailyRecord>): DailyRecord {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    businessId: 'business-1',
    date: new Date('2026-06-01T00:00:00.000Z'),
    revenue: 100,
    tickets: 10,
    averageTicket: 10,
    weather: 'soleado',
    tempMax: null,
    tempMin: null,
    rain: null,
    wind: null,
    event: null,
    campaign: null,
    socialFollowers: null,
    observations: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('RecalibrationCalculator', () => {
  it('devuelve métricas vacías cuando no hay cierres', () => {
    const result = RecalibrationCalculator.computeMetrics('business-1', []);
    expect(result.recordsCount).toBe(0);
    expect(result.totalRevenue).toBe(0);
    expect(result.bestDay).toBeNull();
  });

  it('calcula totales, medias y mejor/peor día', () => {
    const records = [
      makeRecord({ date: new Date('2026-06-01T00:00:00.000Z'), revenue: 100, tickets: 10 }),
      makeRecord({ date: new Date('2026-06-02T00:00:00.000Z'), revenue: 300, tickets: 20 }),
      makeRecord({ date: new Date('2026-06-03T00:00:00.000Z'), revenue: 50, tickets: 5 }),
    ];

    const metrics = RecalibrationCalculator.computeMetrics('business-1', records);

    expect(metrics.recordsCount).toBe(3);
    expect(metrics.totalRevenue).toBe(450);
    expect(metrics.averageDailyRevenue).toBe(150);
    expect(metrics.totalTickets).toBe(35);
    expect(metrics.bestDay).toEqual({ date: '2026-06-02', revenue: 300 });
    expect(metrics.worstDay).toEqual({ date: '2026-06-03', revenue: 50 });
  });

  it('agrupa medias por día de la semana', () => {
    const records = [
      makeRecord({ date: new Date('2026-06-01T00:00:00.000Z'), revenue: 100 }), // lunes
      makeRecord({ date: new Date('2026-06-08T00:00:00.000Z'), revenue: 200 }), // lunes
    ];
    const byDay = RecalibrationCalculator.averageByDayOfWeek(records);
    const monday = new Date('2026-06-01T00:00:00.000Z').getUTCDay();
    expect(byDay[monday]).toBe(150);
  });
});
