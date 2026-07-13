import type { DailyRecord } from '../../types/api';

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export interface ComputedMetrics {
  totalRevenue: number;
  averageDailyRevenue: number;
  totalTickets: number;
  globalAverageTicket: number;
  bestDay: { date: string; revenue: number } | null;
  worstDay: { date: string; revenue: number } | null;
  recordsCount: number;
  averageByDayOfWeek: { label: string; average: number }[];
  averageByWeather: { label: string; average: number }[];
  averageByMonth: { label: string; average: number }[];
  recentTrend: number;
}

/**
 * Cálculo de métricas y comparativas (CU-007/CU-008) en el cliente, a partir
 * de los cierres ya disponibles vía GET daily-records. Se sustituirá por los
 * endpoints de dashboard dedicados en la Fase 4, manteniendo la misma lógica
 * heurística que el backend (RecalibrationCalculator).
 */
export function computeMetrics(records: DailyRecord[]): ComputedMetrics {
  if (records.length === 0) {
    return {
      totalRevenue: 0,
      averageDailyRevenue: 0,
      totalTickets: 0,
      globalAverageTicket: 0,
      bestDay: null,
      worstDay: null,
      recordsCount: 0,
      averageByDayOfWeek: [],
      averageByWeather: [],
      averageByMonth: [],
      recentTrend: 0,
    };
  }

  const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const totalRevenue = sorted.reduce((sum, r) => sum + r.revenue, 0);
  const totalTickets = sorted.reduce((sum, r) => sum + r.tickets, 0);

  const best = sorted.reduce((max, r) => (r.revenue > max.revenue ? r : max), sorted[0]);
  const worst = sorted.reduce((min, r) => (r.revenue < min.revenue ? r : min), sorted[0]);

  const byDay = groupAverage(sorted, (r) => DAY_NAMES[new Date(r.date).getDay()]);
  const byWeather = groupAverage(
    sorted.filter((r) => r.weather),
    (r) => r.weather as string,
  );
  const byMonth = groupAverage(sorted, (r) =>
    new Date(r.date).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
  );

  const last7 = sorted.slice(-7);
  const avgLast7 = last7.reduce((sum, r) => sum + r.revenue, 0) / last7.length;
  const avgAll = totalRevenue / sorted.length;
  const recentTrend = avgAll > 0 ? (avgLast7 - avgAll) / avgAll : 0;

  return {
    totalRevenue,
    averageDailyRevenue: totalRevenue / sorted.length,
    totalTickets,
    globalAverageTicket: totalTickets > 0 ? totalRevenue / totalTickets : 0,
    bestDay: { date: best.date, revenue: best.revenue },
    worstDay: { date: worst.date, revenue: worst.revenue },
    recordsCount: sorted.length,
    averageByDayOfWeek: byDay,
    averageByWeather: byWeather,
    averageByMonth: byMonth,
    recentTrend,
  };
}

function groupAverage(
  records: DailyRecord[],
  keyFn: (record: DailyRecord) => string,
): { label: string; average: number }[] {
  const groups = new Map<string, number[]>();
  for (const record of records) {
    const key = keyFn(record);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(record.revenue);
  }
  return Array.from(groups.entries()).map(([label, values]) => ({
    label,
    average: values.reduce((sum, v) => sum + v, 0) / values.length,
  }));
}

export function buildEvolutionSeries(records: DailyRecord[]) {
  const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let cumulative = 0;
  return sorted.map((r) => {
    cumulative += r.revenue;
    return {
      date: new Date(r.date).toLocaleDateString(),
      revenue: r.revenue,
      tickets: r.tickets,
      averageTicket: r.averageTicket,
      cumulative,
    };
  });
}
