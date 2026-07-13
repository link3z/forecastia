import type { Request, Response } from 'express';

import { NotFoundError } from '../../../domain/errors/AppError.js';
import { RecalibrationCalculator } from '../../../domain/services/RecalibrationCalculator.js';
import {
  businessMetricsRepository,
  businessRepository,
  dailyRecordRepository,
} from '../../../infrastructure/repositories/index.js';

// ── GET /businesses/:businessId/dashboard/metrics (CU-007) ────────────────────

export async function getDashboardMetrics(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { businessId } = req.params;

  const business = await businessRepository.findById(businessId);
  if (!business || business.userId !== userId) throw new NotFoundError('Negocio');

  const stored = await businessMetricsRepository.findByBusinessId(businessId);
  const records = stored
    ? null
    : await dailyRecordRepository.findAllByBusiness(businessId);

  // Preferimos las métricas pre-calculadas si existen; si no, las calculamos al vuelo.
  const metrics = stored
    ? stored
    : RecalibrationCalculator.computeMetrics(businessId, records!);

  // Enriquecemos con medias adicionales calculadas sobre el histórico completo
  const allRecords = await dailyRecordRepository.findAllByBusiness(businessId);
  const byDow = RecalibrationCalculator.averageByDayOfWeek(allRecords);
  const byWeather = RecalibrationCalculator.averageByWeather(allRecords);
  const byMonth = RecalibrationCalculator.averageByMonth(allRecords);

  res.json({ metrics, byDayOfWeek: byDow, byWeather, byMonth });
}

// ── GET /businesses/:businessId/dashboard/evolution (CU-006) ──────────────────

export async function getDashboardEvolution(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { businessId } = req.params;

  const business = await businessRepository.findById(businessId);
  if (!business || business.userId !== userId) throw new NotFoundError('Negocio');

  const records = await dailyRecordRepository.findAllByBusiness(businessId);
  const sorted = [...records].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Serie diaria
  const daily = sorted.map((r) => ({
    date: r.date.toISOString().slice(0, 10),
    revenue: Number(r.revenue),
    tickets: r.tickets,
    averageTicket: Number(r.averageTicket),
  }));

  // Acumulado
  let accumulated = 0;
  const cumulative = sorted.map((r) => {
    accumulated += Number(r.revenue);
    return { date: r.date.toISOString().slice(0, 10), revenue: round(accumulated) };
  });

  // Semanal (ISO week, agrupado por lunes)
  const weeklyMap = new Map<string, number>();
  for (const r of sorted) {
    const monday = getMondayOfWeek(r.date);
    const key = monday.toISOString().slice(0, 10);
    weeklyMap.set(key, round((weeklyMap.get(key) ?? 0) + Number(r.revenue)));
  }
  const weekly = [...weeklyMap.entries()].map(([date, revenue]) => ({ date, revenue }));

  // Mensual
  const monthlyMap = new Map<string, number>();
  for (const r of sorted) {
    const key = `${r.date.getUTCFullYear()}-${String(r.date.getUTCMonth() + 1).padStart(2, '0')}`;
    monthlyMap.set(key, round((monthlyMap.get(key) ?? 0) + Number(r.revenue)));
  }
  const monthly = [...monthlyMap.entries()].map(([date, revenue]) => ({ date, revenue }));

  res.json({ daily, weekly, monthly, cumulative });
}

// ── GET /businesses/:businessId/dashboard/comparisons (CU-008) ────────────────

export async function getDashboardComparisons(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { businessId } = req.params;

  const business = await businessRepository.findById(businessId);
  if (!business || business.userId !== userId) throw new NotFoundError('Negocio');

  const records = await dailyRecordRepository.findAllByBusiness(businessId);

  const byDayOfWeek = groupAverage(records, (r) => String(r.date.getUTCDay()));
  const byWeather = groupAverage(
    records.filter((r) => r.weather),
    (r) => r.weather!,
  );

  // Dispersión caja vs temperatura
  const tempScatter = records
    .filter((r) => r.tempMax !== null)
    .map((r) => ({ x: Number(r.tempMax), y: Number(r.revenue) }));

  // Dispersión caja vs tickets
  const ticketsScatter = records
    .filter((r) => r.tickets > 0)
    .map((r) => ({ x: r.tickets, y: Number(r.revenue) }));

  // Caja vs eventos/campañas: media con vs sin
  const withEvent = records.filter((r) => r.event && r.event.trim().length > 0);
  const withoutEvent = records.filter((r) => !r.event || r.event.trim().length === 0);
  const withCampaign = records.filter((r) => r.campaign && r.campaign.trim().length > 0);
  const withoutCampaign = records.filter((r) => !r.campaign || r.campaign.trim().length === 0);

  res.json({
    byDayOfWeek,
    byWeather,
    tempScatter,
    ticketsScatter,
    events: {
      withEvent: avg(withEvent.map((r) => Number(r.revenue))),
      withoutEvent: avg(withoutEvent.map((r) => Number(r.revenue))),
      withEventCount: withEvent.length,
      withoutEventCount: withoutEvent.length,
    },
    campaigns: {
      withCampaign: avg(withCampaign.map((r) => Number(r.revenue))),
      withoutCampaign: avg(withoutCampaign.map((r) => Number(r.revenue))),
      withCampaignCount: withCampaign.length,
      withoutCampaignCount: withoutCampaign.length,
    },
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupAverage<T>(
  items: T[],
  keyFn: (item: T) => string,
): Array<{ key: string; average: number; count: number }> {
  const buckets = new Map<string, number[]>();
  for (const item of items) {
    const key = keyFn(item);
    const list = buckets.get(key) ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    list.push(Number((item as any).revenue));
    buckets.set(key, list);
  }
  return [...buckets.entries()].map(([key, values]) => ({
    key,
    average: round(avg(values)),
    count: values.length,
  }));
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}
