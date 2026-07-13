import type { BusinessMetricsSnapshot, DayHighlight } from '../entities/BusinessMetrics.js';
import type { DailyRecord } from '../entities/DailyRecord.js';

const RECENT_WINDOW_SIZE = 7;

/**
 * Servicio de dominio puro (sin dependencias de infraestructura) que calcula
 * las métricas principales de un negocio (CU-007) a partir de su histórico
 * de cierres diarios. Lo usa RecalibrateBusinessMetricsUseCase (CU-011) cada
 * vez que se crea, importa o edita un cierre.
 */
export class RecalibrationCalculator {
  static computeMetrics(businessId: string, records: DailyRecord[]): BusinessMetricsSnapshot {
    if (records.length === 0) {
      return {
        businessId,
        totalRevenue: 0,
        averageDailyRevenue: 0,
        totalTickets: 0,
        globalAverageTicket: 0,
        bestDay: null,
        worstDay: null,
        recordsCount: 0,
        recentTrend: 0,
      };
    }

    const sorted = [...records].sort((a, b) => a.date.getTime() - b.date.getTime());

    const totalRevenue = round(sorted.reduce((sum, r) => sum + r.revenue, 0));
    const totalTickets = sorted.reduce((sum, r) => sum + r.tickets, 0);
    const recordsCount = sorted.length;
    const averageDailyRevenue = round(totalRevenue / recordsCount);
    const globalAverageTicket = totalTickets > 0 ? round(totalRevenue / totalTickets) : 0;

    const best = sorted.reduce((a, b) => (b.revenue > a.revenue ? b : a));
    const worst = sorted.reduce((a, b) => (b.revenue < a.revenue ? b : a));

    const bestDay: DayHighlight = { date: toIsoDate(best.date), revenue: best.revenue };
    const worstDay: DayHighlight = { date: toIsoDate(worst.date), revenue: worst.revenue };

    const recentTrend = computeRecentTrend(sorted, averageDailyRevenue);

    return {
      businessId,
      totalRevenue,
      averageDailyRevenue,
      totalTickets,
      globalAverageTicket,
      bestDay,
      worstDay,
      recordsCount,
      recentTrend,
    };
  }

  /** Media de caja agrupada por día de la semana (0 = domingo ... 6 = sábado). */
  static averageByDayOfWeek(records: DailyRecord[]): Record<number, number> {
    const buckets = new Map<number, number[]>();
    for (const record of records) {
      const day = record.date.getUTCDay();
      const list = buckets.get(day) ?? [];
      list.push(record.revenue);
      buckets.set(day, list);
    }
    const result: Record<number, number> = {};
    for (const [day, values] of buckets) {
      result[day] = round(average(values));
    }
    return result;
  }

  /** Media de caja agrupada por condición climática. */
  static averageByWeather(records: DailyRecord[]): Record<string, number> {
    const buckets = new Map<string, number[]>();
    for (const record of records) {
      if (!record.weather) continue;
      const list = buckets.get(record.weather) ?? [];
      list.push(record.revenue);
      buckets.set(record.weather, list);
    }
    const result: Record<string, number> = {};
    for (const [weather, values] of buckets) {
      result[weather] = round(average(values));
    }
    return result;
  }

  /** Media de caja agrupada por mes (1-12). */
  static averageByMonth(records: DailyRecord[]): Record<number, number> {
    const buckets = new Map<number, number[]>();
    for (const record of records) {
      const month = record.date.getUTCMonth() + 1;
      const list = buckets.get(month) ?? [];
      list.push(record.revenue);
      buckets.set(month, list);
    }
    const result: Record<number, number> = {};
    for (const [month, values] of buckets) {
      result[month] = round(average(values));
    }
    return result;
  }
}

function computeRecentTrend(sortedRecords: DailyRecord[], historicalAverage: number): number {
  if (historicalAverage === 0 || sortedRecords.length === 0) return 0;
  const recent = sortedRecords.slice(-RECENT_WINDOW_SIZE);
  const recentAverage = average(recent.map((r) => r.revenue));
  return round((recentAverage - historicalAverage) / historicalAverage, 4);
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
