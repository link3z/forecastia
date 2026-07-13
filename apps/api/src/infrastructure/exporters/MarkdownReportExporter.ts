import type { Business } from '../../domain/entities/Business.js';
import type { BusinessMetrics } from '../../domain/entities/BusinessMetrics.js';
import type { DailyRecord } from '../../domain/entities/DailyRecord.js';
import type { Forecast } from '../../domain/entities/Forecast.js';

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/**
 * Genera un informe completo del negocio en formato Markdown (CU-018).
 *
 * Contenido:
 *  - Nombre del negocio, periodo analizado
 *  - Métricas principales (caja acumulada, media, tickets, ticket medio, mejor/peor día)
 *  - Evolución mensual resumida
 *  - Últimas predicciones con escenarios
 *  - Explicación IA o fallback del último forecast
 *  - Recomendaciones básicas
 */
export class MarkdownReportExporter {
  generate(
    business: Business,
    records: DailyRecord[],
    metrics: BusinessMetrics | null,
    forecasts: Forecast[],
  ): string {
    const now = new Date();
    const sorted = [...records].sort((a, b) => a.date.getTime() - b.date.getTime());
    const firstDate = sorted[0]?.date ?? now;
    const lastDate = sorted[sorted.length - 1]?.date ?? now;

    const fmt = (v: number) =>
      new Intl.NumberFormat('es-ES', { style: 'currency', currency: business.currency }).format(v);

    const lines: string[] = [];

    // ── Cabecera ──────────────────────────────────────────────────────────────
    lines.push(`# Informe ForecastIA — ${business.name}`);
    lines.push('');
    lines.push(`**Generado el:** ${formatDate(now)}`);
    lines.push(`**Negocio:** ${business.name} (${business.type})`);
    lines.push(`**Ubicación:** ${business.location}`);
    lines.push(`**Moneda:** ${business.currency}`);
    if (sorted.length > 0) {
      lines.push(
        `**Periodo analizado:** ${formatDate(firstDate)} – ${formatDate(lastDate)}`,
      );
    }
    lines.push('');

    // ── Métricas principales ──────────────────────────────────────────────────
    lines.push('## Métricas principales');
    lines.push('');

    if (metrics) {
      lines.push(`| Indicador | Valor |`);
      lines.push(`|---|---|`);
      lines.push(`| Caja acumulada | ${fmt(metrics.totalRevenue)} |`);
      lines.push(`| Caja media diaria | ${fmt(metrics.averageDailyRevenue)} |`);
      lines.push(`| Total de tickets | ${metrics.totalTickets.toLocaleString('es-ES')} |`);
      lines.push(`| Ticket medio global | ${fmt(metrics.globalAverageTicket)} |`);
      lines.push(`| Cierres registrados | ${metrics.recordsCount} |`);
      lines.push(
        `| Tendencia reciente | ${metrics.recentTrend >= 0 ? '+' : ''}${(metrics.recentTrend * 100).toFixed(1)}% |`,
      );
      if (metrics.bestDay) {
        lines.push(
          `| Mejor día | ${metrics.bestDay.date} — ${fmt(metrics.bestDay.revenue)} |`,
        );
      }
      if (metrics.worstDay) {
        lines.push(
          `| Peor día | ${metrics.worstDay.date} — ${fmt(metrics.worstDay.revenue)} |`,
        );
      }
    } else {
      lines.push('_Sin métricas calculadas todavía._');
    }
    lines.push('');

    // ── Evolución mensual ─────────────────────────────────────────────────────
    if (sorted.length > 0) {
      lines.push('## Evolución mensual');
      lines.push('');

      const monthly = new Map<string, number>();
      for (const r of sorted) {
        const key = `${r.date.getUTCFullYear()}-${String(r.date.getUTCMonth() + 1).padStart(2, '0')}`;
        monthly.set(key, (monthly.get(key) ?? 0) + r.revenue);
      }

      lines.push('| Mes | Caja total |');
      lines.push('|---|---|');
      for (const [key, total] of monthly) {
        const [year, month] = key.split('-');
        const label = `${MONTH_NAMES[Number(month) - 1] ?? month} ${year}`;
        lines.push(`| ${label} | ${fmt(total)} |`);
      }
      lines.push('');
    }

    // ── Últimas predicciones ──────────────────────────────────────────────────
    const recentForecasts = [...forecasts]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    if (recentForecasts.length > 0) {
      lines.push('## Últimas predicciones');
      lines.push('');
      lines.push('| Fecha objetivo | Pesimista | Esperado | Optimista |');
      lines.push('|---|---|---|---|');
      for (const f of recentForecasts) {
        lines.push(
          `| ${formatDate(f.targetDate)} | ${fmt(f.pessimisticScenario)} | ${fmt(f.expectedRevenue)} | ${fmt(f.optimisticScenario)} |`,
        );
      }
      lines.push('');

      // Explicación del forecast más reciente
      const latest = recentForecasts[0];
      if (latest?.aiExplanation) {
        lines.push('### Análisis de la última predicción');
        lines.push('');
        lines.push(`> ${latest.aiExplanation}`);
        lines.push('');
      }
    }

    // ── Principales factores ──────────────────────────────────────────────────
    lines.push('## Principales factores identificados');
    lines.push('');

    const byWeather = groupAvgRevenue(sorted, (r) => r.weather);
    if (byWeather.size > 0) {
      lines.push('**Caja media por clima:**');
      lines.push('');
      for (const [weather, avg] of byWeather) {
        lines.push(`- ${capitalize(weather)}: ${fmt(avg)}`);
      }
      lines.push('');
    }

    const withEvent = sorted.filter((r) => r.event && r.event.trim().length > 0);
    const withoutEvent = sorted.filter((r) => !r.event || r.event.trim().length === 0);
    if (withEvent.length > 0 && withoutEvent.length > 0) {
      const avgWith = avgRevenue(withEvent);
      const avgWithout = avgRevenue(withoutEvent);
      const diff = ((avgWith - avgWithout) / avgWithout) * 100;
      lines.push(
        `**Efecto de eventos:** los días con evento registran de media ${fmt(avgWith)} ` +
          `vs ${fmt(avgWithout)} sin evento (${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%).`,
      );
      lines.push('');
    }

    // ── Recomendaciones ───────────────────────────────────────────────────────
    lines.push('## Recomendaciones');
    lines.push('');

    if (metrics) {
      if (metrics.recentTrend > 0.05) {
        lines.push(
          `- La tendencia reciente es **positiva** (+${(metrics.recentTrend * 100).toFixed(1)}%). ` +
            `Mantén la operativa actual y considera ampliar capacidad en picos futuros.`,
        );
      } else if (metrics.recentTrend < -0.05) {
        lines.push(
          `- La tendencia reciente es **negativa** (${(metrics.recentTrend * 100).toFixed(1)}%). ` +
            `Revisa la oferta y valora acciones de marketing o campañas para reactivar la demanda.`,
        );
      } else {
        lines.push('- La tendencia reciente es estable. Continúa registrando datos para afinar las predicciones.');
      }
    }

    lines.push('- Registra cierres con la mayor cantidad de variables posible (clima, eventos, campañas) para mejorar la precisión del modelo.');
    lines.push('- Usa la herramienta de predicción antes de jornadas especiales para planificar personal y stock.');
    lines.push('');

    // ── Pie ───────────────────────────────────────────────────────────────────
    lines.push('---');
    lines.push('');
    lines.push(`_Informe generado automáticamente por ForecastIA · ${formatDate(now)}_`);

    return lines.join('\n');
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function groupAvgRevenue(
  records: DailyRecord[],
  keyFn: (r: DailyRecord) => string | null | undefined,
): Map<string, number> {
  const buckets = new Map<string, number[]>();
  for (const r of records) {
    const key = keyFn(r);
    if (!key) continue;
    const list = buckets.get(key) ?? [];
    list.push(r.revenue);
    buckets.set(key, list);
  }
  const result = new Map<string, number>();
  for (const [key, values] of buckets) {
    result.set(key, avgRevenue(values.map((v) => ({ revenue: v }) as DailyRecord)));
  }
  return result;
}

function avgRevenue(records: (DailyRecord | { revenue: number })[]): number {
  if (records.length === 0) return 0;
  return records.reduce((s, r) => s + r.revenue, 0) / records.length;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
