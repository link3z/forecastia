import type { DailyRecord } from '../../domain/entities/DailyRecord.js';
import type { BusinessMetrics } from '../../domain/entities/BusinessMetrics.js';

/**
 * Exporta los cierres diarios de un negocio como CSV (CU-017).
 *
 * Cabecera compatible con el formato de importación (CU-004), de forma
 * que un archivo exportado puede reimportarse directamente.
 */
export class CsvExporter {
  exportDailyRecords(records: DailyRecord[]): string {
    const header =
      'fecha,caja,tickets,ticketMedio,clima,tempMax,tempMin,lluvia,viento,eventos,campania,seguidores,observaciones';

    const rows = records
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((r) =>
        [
          toIsoDate(r.date),
          r.revenue.toFixed(2),
          r.tickets,
          r.averageTicket.toFixed(2),
          r.weather ?? '',
          r.tempMax ?? '',
          r.tempMin ?? '',
          r.rain ?? '',
          r.wind ?? '',
          csvEscape(r.event ?? ''),
          csvEscape(r.campaign ?? ''),
          r.socialFollowers ?? '',
          csvEscape(r.observations ?? ''),
        ].join(','),
      );

    return [header, ...rows].join('\n');
  }

  exportMetrics(metrics: BusinessMetrics): string {
    const header = 'metrica,valor';
    const rows = [
      ['totalRevenue', metrics.totalRevenue.toFixed(2)],
      ['averageDailyRevenue', metrics.averageDailyRevenue.toFixed(2)],
      ['totalTickets', metrics.totalTickets],
      ['globalAverageTicket', metrics.globalAverageTicket.toFixed(2)],
      ['recordsCount', metrics.recordsCount],
      ['recentTrend', (metrics.recentTrend * 100).toFixed(2) + '%'],
      ['bestDay', metrics.bestDay ? `${metrics.bestDay.date} (${metrics.bestDay.revenue})` : ''],
      ['worstDay', metrics.worstDay ? `${metrics.worstDay.date} (${metrics.worstDay.revenue})` : ''],
    ].map(([k, v]) => `${k},${v}`);

    return [header, ...rows].join('\n');
  }
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
