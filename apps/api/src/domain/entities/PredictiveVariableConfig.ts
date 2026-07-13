export interface PredictiveVariableConfig {
  id: string;
  businessId: string;
  useWeather: boolean;
  useTemperature: boolean;
  useRain: boolean;
  useWind: boolean;
  useEvents: boolean;
  useCampaigns: boolean;
  useSocialFollowers: boolean;
  useObservations: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type NewPredictiveVariableConfig = Omit<
  PredictiveVariableConfig,
  'id' | 'createdAt' | 'updatedAt'
>;

export type PredictiveVariableConfigUpdate = Partial<
  Omit<PredictiveVariableConfig, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>
>;

export const DEFAULT_PREDICTIVE_VARIABLE_CONFIG: Omit<
  NewPredictiveVariableConfig,
  'businessId'
> = {
  useWeather: true,
  useTemperature: true,
  useRain: true,
  useWind: false,
  useEvents: true,
  useCampaigns: true,
  useSocialFollowers: false,
  useObservations: true,
};
