import { describe, it, expect } from 'vitest';
import { RecalibrationCalculator } from '../../domain/services/RecalibrationCalculator.js';
import type { DailyRecord } from '../../domain/entities/DailyRecord.js';

function record(date: string, revenue: number, tickets = 10): DailyRecord {
  return {
    id: date,
    businessId: 'biz-1',
    date: new Date(date),
    revenue,
    tickets,
    averageTicket: revenue / tickets,
    weather: null, tempMax: null, tempMin: null,
    rain: null, wind: null, event: null, campaign: null,
    socialFollowers: null, observations: null,
    createdAt: new Date(), updatedAt: new Date(),
  };
}

describe('RecalibrationCalculator.computeMetrics', () => {
  it('devuelve métricas vacías cuando no hay registros', () => {
    const result = RecalibrationCalculator.computeMetrics('biz-1', []);
    expect(result.totalRevenue).toBe(0);
    expect(result.recordsCount).toBe(0);
    expect(result.bestDay).toBeNull();
    expect(result.worstDay).toBeNull();
  });

  it('calcula correctamente la caja total y media', () => {
    const records = [
      record('2024-06-01', 100),
      record('2024-06-02', 200),
      record('2024-06-03', 300),
    ];
    const result = RecalibrationCalculator.computeMetrics('biz-1', records);
    expect(result.totalRevenue).toBe(600);
    expect(result.averageDailyRevenue).toBe(200);
    expect(result.recordsCount).toBe(3);
  });

  it('identifica el mejor y peor día correctamente', () => {
    const records = [
      record('2024-06-01', 100),
      record('2024-06-02', 500),
      record('2024-06-03', 50),
    ];
    const result = RecalibrationCalculator.computeMetrics('biz-1', records);
    expect(result.bestDay?.revenue).toBe(500);
    expect(result.worstDay?.revenue).toBe(50);
  });

  it('calcula tickets totales y ticket medio', () => {
    const records = [
      record('2024-06-01', 300, 30),
      record('2024-06-02', 600, 60),
    ];
    const result = RecalibrationCalculator.computeMetrics('biz-1', records);
    expect(result.totalTickets).toBe(90);
    expect(result.globalAverageTicket).toBeCloseTo(10, 1);
  });

  it('calcula medias por día de semana', () => {
    const records = [
      record('2024-06-03', 300), // lunes
      record('2024-06-10', 400), // otro lunes
    ];
    const byDow = RecalibrationCalculator.averageByDayOfWeek(records);
    // Lunes = 1
    expect(byDow[1]).toBeCloseTo(350, 0);
  });
});
