import { describe, it, expect } from 'vitest';
import { HeuristicForecastService } from '../../domain/services/HeuristicForecastService.js';
import type { DailyRecord } from '../../domain/entities/DailyRecord.js';
import type { PredictiveVariableConfig } from '../../domain/entities/PredictiveVariableConfig.js';

const service = new HeuristicForecastService();

const configBase: PredictiveVariableConfig = {
  id: 'cfg-1',
  businessId: 'biz-1',
  useWeather: true,
  useTemperature: true,
  useRain: true,
  useWind: false,
  useEvents: true,
  useCampaigns: true,
  useSocialFollowers: false,
  useObservations: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeRecord(date: string, revenue: number, tickets = 50): DailyRecord {
  return {
    id: date,
    businessId: 'biz-1',
    date: new Date(date),
    revenue,
    tickets,
    averageTicket: revenue / tickets,
    weather: null,
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
  };
}

// 30 registros Monday-to-Friday con 300€ media
const records30: DailyRecord[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date('2024-06-01');
  d.setUTCDate(d.getUTCDate() + i);
  return makeRecord(d.toISOString().slice(0, 10), 250 + Math.random() * 100);
});

describe('HeuristicForecastService', () => {
  it('devuelve una predicción coherente con datos históricos', () => {
    const input = {
      targetDate: new Date('2024-07-15'),
      weather: null,
      tempMax: null,
      tempMin: null,
      rain: null,
      wind: null,
      event: null,
      campaign: null,
      observations: null,
    };
    const result = service.compute(records30, input, configBase, [100, 200, 300, 500]);

    expect(result.expectedRevenue).toBeGreaterThan(0);
    expect(result.minRevenue).toBeLessThanOrEqual(result.expectedRevenue);
    expect(result.maxRevenue).toBeGreaterThanOrEqual(result.expectedRevenue);
    expect(result.pessimisticScenario).toBeLessThanOrEqual(result.expectedRevenue);
    expect(result.optimisticScenario).toBeGreaterThanOrEqual(result.expectedRevenue);
  });

  it('aplica ajuste positivo para clima soleado', () => {
    const base = service.compute(
      records30,
      { targetDate: new Date('2024-07-15'), weather: null },
      configBase,
      [],
    );
    const sunny = service.compute(
      records30,
      { targetDate: new Date('2024-07-15'), weather: 'soleado' },
      configBase,
      [],
    );
    expect(sunny.expectedRevenue).toBeGreaterThan(base.expectedRevenue);
  });

  it('aplica ajuste negativo para tormenta', () => {
    const base = service.compute(
      records30,
      { targetDate: new Date('2024-07-15'), weather: null },
      configBase,
      [],
    );
    const storm = service.compute(
      records30,
      { targetDate: new Date('2024-07-15'), weather: 'tormenta' },
      configBase,
      [],
    );
    expect(storm.expectedRevenue).toBeLessThan(base.expectedRevenue);
  });

  it('aplica ajuste positivo para evento', () => {
    const base = service.compute(
      records30,
      { targetDate: new Date('2024-07-15') },
      configBase,
      [],
    );
    const event = service.compute(
      records30,
      { targetDate: new Date('2024-07-15'), event: 'Festival de verano' },
      configBase,
      [],
    );
    expect(event.expectedRevenue).toBeGreaterThan(base.expectedRevenue);
  });

  it('calcula probabilidades para los umbrales dados', () => {
    const result = service.compute(
      records30,
      { targetDate: new Date('2024-07-15') },
      configBase,
      [100, 500],
    );
    expect(result.probabilities).toHaveProperty('100');
    expect(result.probabilities).toHaveProperty('500');
    // Probabilidad entre 0 y 1
    expect(result.probabilities[100]).toBeGreaterThanOrEqual(0);
    expect(result.probabilities[100]).toBeLessThanOrEqual(1);
  });

  it('devuelve predicción cero sin histórico', () => {
    const result = service.compute([], { targetDate: new Date('2024-07-15') }, configBase, []);
    expect(result.expectedRevenue).toBe(0);
  });

  it('incluye factores influyentes en el resultado', () => {
    const result = service.compute(
      records30,
      { targetDate: new Date('2024-07-15'), weather: 'soleado', event: 'Verbena' },
      configBase,
      [],
    );
    expect(result.influencingFactors.length).toBeGreaterThan(0);
    const factorNames = result.influencingFactors.map((f) => f.factor);
    expect(factorNames).toContain('clima');
  });
});
