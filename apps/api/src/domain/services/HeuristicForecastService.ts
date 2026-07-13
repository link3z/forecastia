/**
 * HeuristicForecastService — Modelo predictivo heurístico explicable (CU-009/010).
 *
 * Primera versión basada en promedios históricos y ajustes por variables externas.
 * La clase está aislada del resto del sistema para que pueda sustituirse por un
 * modelo de ML real en el futuro sin cambiar los casos de uso que la consumen.
 *
 * Fórmula (ver docs/07-arquitectura.md y especificación del TFM):
 *  1. Base = 0.4 × mediaGlobal + 0.4 × mediaDíaSemana + 0.2 × (mediaGlobal × (1 + tendenciaReciente))
 *  2. Ajustar por clima, temperatura, lluvia, eventos y campañas.
 *  3. min/max = base ± desviación típica histórica.
 *  4. Probabilidades de superar umbrales via aproximación normal.
 */

import type { InfluencingFactor } from '../entities/Forecast.js';
import type { DailyRecord } from '../entities/DailyRecord.js';
import type { PredictiveVariableConfig } from '../entities/PredictiveVariableConfig.js';

export interface ForecastInput {
  targetDate: Date;
  weather?: string | null;
  tempMax?: number | null;
  tempMin?: number | null;
  rain?: string | null;
  wind?: string | null;
  event?: string | null;
  campaign?: string | null;
  observations?: string | null;
}

export interface ForecastResult {
  expectedRevenue: number;
  minRevenue: number;
  maxRevenue: number;
  pessimisticScenario: number;
  averageScenario: number;
  optimisticScenario: number;
  probabilities: Record<string, number>;
  influencingFactors: InfluencingFactor[];
}

// Ajustes de clima según el spec
const WEATHER_ADJUSTMENTS: Record<string, number> = {
  soleado: 0.15,
  'parcialmente nublado': 0.05,
  nublado: -0.05,
  lluvia: -0.2,
  tormenta: -0.35,
};

// Temperatura: se asume negocio de tipo exterior/chiringuito
const TEMP_HIGH_THRESHOLD = 28; // °C
const TEMP_LOW_THRESHOLD = 18; // °C
const TEMP_HIGH_EFFECT = 0.1;
const TEMP_LOW_EFFECT = -0.1;

// Lluvia fuerte vs ligera (campo rain separado del clima)
const RAIN_HEAVY_KEYWORDS = ['fuerte', 'intensa', 'torrencial', 'heavy'];
const RAIN_LIGHT_KEYWORDS = ['ligera', 'fina', 'leve', 'light', 'drizzle', 'lluvia'];

export class HeuristicForecastService {
  /**
   * Genera una predicción heurística para la fecha y variables indicadas.
   *
   * @param records - Histórico de cierres del negocio (ordenado por fecha).
   * @param input   - Variables para la fecha objetivo.
   * @param config  - Configuración de qué variables usar.
   * @param thresholds - Umbrales de probabilidad del negocio.
   */
  compute(
    records: DailyRecord[],
    input: ForecastInput,
    config: PredictiveVariableConfig,
    thresholds: number[],
  ): ForecastResult {
    const factors: InfluencingFactor[] = [];

    // ── 1. BASE ──────────────────────────────────────────────────────────────
    const revenues = records.map((r) => r.revenue);
    const globalAverage = average(revenues);

    if (globalAverage === 0) {
      // Sin histórico: devolvemos ceros explicados
      return this.zeroResult(thresholds);
    }

    const dayOfWeek = input.targetDate.getUTCDay();
    const dayRevenues = records
      .filter((r) => r.date.getUTCDay() === dayOfWeek)
      .map((r) => r.revenue);
    const dayAverage = dayRevenues.length > 0 ? average(dayRevenues) : globalAverage;

    const recentTrend = this.recentTrend(records, globalAverage);
    const trendBase = globalAverage * (1 + recentTrend);

    let base = 0.4 * globalAverage + 0.4 * dayAverage + 0.2 * trendBase;

    factors.push({
      factor: 'base_historica',
      effect: 0,
      description: `Base calculada: media global €${round(globalAverage)}, media ${dayName(dayOfWeek)} €${round(dayAverage)}, tendencia ${(recentTrend * 100).toFixed(1)}%`,
    });

    // ── 2. AJUSTES ────────────────────────────────────────────────────────────

    // Clima
    if (config.useWeather && input.weather) {
      const weatherKey = input.weather.toLowerCase().trim();
      const effect = WEATHER_ADJUSTMENTS[weatherKey] ?? 0;
      if (effect !== 0) {
        base *= 1 + effect;
        factors.push({
          factor: 'clima',
          effect,
          description: `Clima "${input.weather}": ${effect > 0 ? '+' : ''}${(effect * 100).toFixed(0)}%`,
        });
      }
    }

    // Temperatura
    if (config.useTemperature && input.tempMax !== null && input.tempMax !== undefined) {
      let tempEffect = 0;
      if (input.tempMax >= TEMP_HIGH_THRESHOLD) {
        tempEffect = TEMP_HIGH_EFFECT;
      } else if (input.tempMax <= TEMP_LOW_THRESHOLD) {
        tempEffect = TEMP_LOW_EFFECT;
      }
      if (tempEffect !== 0) {
        base *= 1 + tempEffect;
        factors.push({
          factor: 'temperatura',
          effect: tempEffect,
          description: `Temp. máxima ${input.tempMax}°C: ${tempEffect > 0 ? '+' : ''}${(tempEffect * 100).toFixed(0)}%`,
        });
      }
    }

    // Lluvia (intensidad, campo separado del clima)
    if (config.useRain && input.rain) {
      const rainLower = input.rain.toLowerCase();
      let rainEffect = 0;
      if (RAIN_HEAVY_KEYWORDS.some((k) => rainLower.includes(k))) {
        rainEffect = -0.25;
      } else if (RAIN_LIGHT_KEYWORDS.some((k) => rainLower.includes(k))) {
        rainEffect = -0.1;
      }
      if (rainEffect !== 0) {
        base *= 1 + rainEffect;
        factors.push({
          factor: 'lluvia',
          effect: rainEffect,
          description: `Lluvia "${input.rain}": ${(rainEffect * 100).toFixed(0)}%`,
        });
      }
    }

    // Eventos
    if (config.useEvents && input.event && input.event.trim().length > 0) {
      const eventEffect = 0.2;
      base *= 1 + eventEffect;
      factors.push({
        factor: 'evento',
        effect: eventEffect,
        description: `Evento "${input.event}": +${(eventEffect * 100).toFixed(0)}%`,
      });
    }

    // Campañas
    if (config.useCampaigns && input.campaign && input.campaign.trim().length > 0) {
      const campaignEffect = 0.1;
      base *= 1 + campaignEffect;
      factors.push({
        factor: 'campaña',
        effect: campaignEffect,
        description: `Campaña "${input.campaign}": +${(campaignEffect * 100).toFixed(0)}%`,
      });
    }

    // ── 3. INTERVALOS ─────────────────────────────────────────────────────────
    const stdDev = standardDeviation(revenues);
    const expected = round(base);
    const minRevenue = round(Math.max(0, expected - stdDev));
    const maxRevenue = round(expected + stdDev);

    // ── 4. ESCENARIOS ─────────────────────────────────────────────────────────
    const pessimisticScenario = minRevenue;
    const averageScenario = expected;
    const optimisticScenario = maxRevenue;

    // ── 5. PROBABILIDADES ─────────────────────────────────────────────────────
    const probabilities: Record<string, number> = {};
    for (const threshold of thresholds) {
      probabilities[String(threshold)] = round(
        probabilityAbove(expected, stdDev, threshold),
        4,
      );
    }

    return {
      expectedRevenue: expected,
      minRevenue,
      maxRevenue,
      pessimisticScenario,
      averageScenario,
      optimisticScenario,
      probabilities,
      influencingFactors: factors,
    };
  }

  private recentTrend(records: DailyRecord[], globalAverage: number): number {
    if (globalAverage === 0 || records.length === 0) return 0;
    const sorted = [...records].sort((a, b) => a.date.getTime() - b.date.getTime());
    const recent = sorted.slice(-7).map((r) => r.revenue);
    const recentAvg = average(recent);
    return (recentAvg - globalAverage) / globalAverage;
  }

  private zeroResult(thresholds: number[]): ForecastResult {
    const probabilities: Record<string, number> = {};
    for (const t of thresholds) {
      probabilities[String(t)] = 0;
    }
    return {
      expectedRevenue: 0,
      minRevenue: 0,
      maxRevenue: 0,
      pessimisticScenario: 0,
      averageScenario: 0,
      optimisticScenario: 0,
      probabilities,
      influencingFactors: [
        {
          factor: 'sin_historico',
          effect: 0,
          description: 'No hay cierres históricos suficientes para calcular una predicción.',
        },
      ],
    };
  }
}

// ── Helpers matemáticos ────────────────────────────────────────────────────────

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = average(values);
  const variance = values.reduce((s, v) => s + (v - avg) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * P(X > threshold) usando la función de distribución acumulada normal
 * con aproximación a la función de error (erf) mediante serie de Horner.
 */
function probabilityAbove(mean: number, stdDev: number, threshold: number): number {
  if (stdDev === 0) return mean >= threshold ? 1 : 0;
  const z = (threshold - mean) / (stdDev * Math.SQRT2);
  return Math.max(0, Math.min(1, 0.5 * (1 - erf(z))));
}

function erf(x: number): number {
  // Abramowitz & Stegun approximation 7.1.26
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const t = 1 / (1 + p * Math.abs(x));
  const poly = t * (a1 + t * (a2 + t * (a3 + t * (a4 + t * a5))));
  return sign * (1 - poly * Math.exp(-x * x));
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function dayName(dayOfWeek: number): string {
  const names = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  return names[dayOfWeek] ?? String(dayOfWeek);
}
