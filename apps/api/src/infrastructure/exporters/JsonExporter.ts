import type { DailyRecord } from '../../domain/entities/DailyRecord.js';
import type { BusinessMetrics } from '../../domain/entities/BusinessMetrics.js';
import type { Forecast } from '../../domain/entities/Forecast.js';
import type { Business } from '../../domain/entities/Business.js';

/**
 * Exporta todos los datos de un negocio como JSON (CU-017).
 */
export class JsonExporter {
  export(
    business: Business,
    records: DailyRecord[],
    metrics: BusinessMetrics | null,
    forecasts: Forecast[],
  ): string {
    const payload = {
      exportedAt: new Date().toISOString(),
      business: {
        id: business.id,
        name: business.name,
        type: business.type,
        location: business.location,
        currency: business.currency,
        startDate: business.startDate.toISOString().slice(0, 10),
        isSeasonal: business.isSeasonal,
        thresholds: business.thresholds,
      },
      metrics: metrics
        ? {
            totalRevenue: metrics.totalRevenue,
            averageDailyRevenue: metrics.averageDailyRevenue,
            totalTickets: metrics.totalTickets,
            globalAverageTicket: metrics.globalAverageTicket,
            bestDay: metrics.bestDay,
            worstDay: metrics.worstDay,
            recordsCount: metrics.recordsCount,
            recentTrend: metrics.recentTrend,
            updatedAt: metrics.updatedAt.toISOString(),
          }
        : null,
      dailyRecords: records
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map((r) => ({
          date: r.date.toISOString().slice(0, 10),
          revenue: r.revenue,
          tickets: r.tickets,
          averageTicket: r.averageTicket,
          weather: r.weather,
          tempMax: r.tempMax,
          tempMin: r.tempMin,
          rain: r.rain,
          wind: r.wind,
          event: r.event,
          campaign: r.campaign,
          socialFollowers: r.socialFollowers,
          observations: r.observations,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        })),
      forecasts: forecasts.map((f) => ({
        targetDate: f.targetDate.toISOString().slice(0, 10),
        expectedRevenue: f.expectedRevenue,
        minRevenue: f.minRevenue,
        maxRevenue: f.maxRevenue,
        pessimisticScenario: f.pessimisticScenario,
        averageScenario: f.averageScenario,
        optimisticScenario: f.optimisticScenario,
        probabilities: f.probabilities,
        influencingFactors: f.influencingFactors,
        aiExplanation: f.aiExplanation,
        inputVariables: f.inputVariables,
        createdAt: f.createdAt.toISOString(),
      })),
    };

    return JSON.stringify(payload, null, 2);
  }
}
