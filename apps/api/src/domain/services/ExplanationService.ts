import type { InfluencingFactor } from '../entities/Forecast.js';

/**
 * Datos que se pasan al servicio de explicación para que genere
 * una descripción en lenguaje natural de la predicción (CU-012).
 */
export interface ExplanationData {
  businessName: string;
  targetDate: Date;
  expectedRevenue: number;
  minRevenue: number;
  maxRevenue: number;
  pessimisticScenario: number;
  optimisticScenario: number;
  probabilities: Record<string, number>;
  influencingFactors: InfluencingFactor[];
  /** Variables de entrada usadas para la predicción */
  inputVariables: {
    weather?: string | null;
    tempMax?: number | null;
    tempMin?: number | null;
    rain?: string | null;
    wind?: string | null;
    event?: string | null;
    campaign?: string | null;
  };
}

/**
 * Puerto del dominio para la generación de explicaciones en lenguaje natural.
 * Implementado por OpenAIExplanationService (si hay API key) o
 * LocalFallbackExplanationService (sin API key).
 */
export interface ExplanationService {
  explain(data: ExplanationData): Promise<string>;
}
