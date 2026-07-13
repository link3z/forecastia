export interface InfluencingFactor {
  factor: string;
  effect: number; // efecto multiplicativo aplicado, ej. 0.15 = +15%
  description: string;
}

export interface Forecast {
  id: string;
  businessId: string;
  targetDate: Date;
  expectedRevenue: number;
  minRevenue: number;
  maxRevenue: number;
  pessimisticScenario: number;
  averageScenario: number;
  optimisticScenario: number;
  probabilities: Record<string, number>; // umbral -> probabilidad [0,1]
  influencingFactors: InfluencingFactor[];
  aiExplanation: string | null;
  inputVariables: Record<string, unknown>;
  createdAt: Date;
}

export type NewForecast = Omit<Forecast, 'id' | 'createdAt'>;
