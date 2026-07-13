import { apiClient } from './apiClient';

export interface GenerateForecastInput {
  targetDate: string; // ISO date string YYYY-MM-DD
  weather?: string | null;
  tempMax?: number | null;
  tempMin?: number | null;
  rain?: string | null;
  wind?: string | null;
  event?: string | null;
  campaign?: string | null;
  observations?: string | null;
}

export interface InfluencingFactor {
  factor: string;
  effect: number;
  description: string;
}

export interface Forecast {
  id: string;
  businessId: string;
  targetDate: string;
  expectedRevenue: number;
  minRevenue: number;
  maxRevenue: number;
  pessimisticScenario: number;
  averageScenario: number;
  optimisticScenario: number;
  probabilities: Record<string, number>;
  influencingFactors: InfluencingFactor[];
  aiExplanation: string | null;
  inputVariables: Record<string, unknown>;
  createdAt: string;
}

export async function generateForecast(businessId: string, input: GenerateForecastInput): Promise<Forecast> {
  const { data } = await apiClient.post<{ forecast: Forecast }>(
    `/businesses/${businessId}/forecasts`,
    input,
  );
  return data.forecast;
}

export async function listForecasts(businessId: string): Promise<Forecast[]> {
  const { data } = await apiClient.get<{ forecasts: Forecast[] }>(
    `/businesses/${businessId}/forecasts`,
  );
  return data.forecasts;
}
