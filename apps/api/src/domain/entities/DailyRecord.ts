import { DomainValidationError } from '../errors/AppError.js';

export interface DailyRecord {
  id: string;
  businessId: string;
  date: Date;
  revenue: number;
  tickets: number;
  averageTicket: number;
  weather: string | null;
  tempMax: number | null;
  tempMin: number | null;
  rain: string | null;
  wind: string | null;
  event: string | null;
  campaign: string | null;
  socialFollowers: number | null;
  observations: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyRecordInput {
  businessId: string;
  date: Date;
  revenue: number;
  tickets: number;
  averageTicket?: number | null;
  weather?: string | null;
  tempMax?: number | null;
  tempMin?: number | null;
  rain?: string | null;
  wind?: string | null;
  event?: string | null;
  campaign?: string | null;
  socialFollowers?: number | null;
  observations?: string | null;
}

export type NewDailyRecord = Omit<DailyRecord, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Aplica las reglas de negocio del CU-003/CU-005:
 * - la caja no puede ser negativa
 * - los tickets no pueden ser negativos
 * - si hay caja y tickets, el ticket medio se calcula automáticamente
 */
export function buildDailyRecordData(input: DailyRecordInput): NewDailyRecord {
  if (input.revenue < 0) {
    throw new DomainValidationError('La caja no puede ser negativa.');
  }
  if (input.tickets < 0) {
    throw new DomainValidationError('Los tickets no pueden ser negativos.');
  }

  const averageTicket =
    input.averageTicket != null && input.averageTicket > 0
      ? input.averageTicket
      : input.tickets > 0
        ? roundCurrency(input.revenue / input.tickets)
        : 0;

  return {
    businessId: input.businessId,
    date: input.date,
    revenue: input.revenue,
    tickets: input.tickets,
    averageTicket,
    weather: input.weather ?? null,
    tempMax: input.tempMax ?? null,
    tempMin: input.tempMin ?? null,
    rain: input.rain ?? null,
    wind: input.wind ?? null,
    event: input.event ?? null,
    campaign: input.campaign ?? null,
    socialFollowers: input.socialFollowers ?? null,
    observations: input.observations ?? null,
  };
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}
