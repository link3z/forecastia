/**
 * Tipos que representan las respuestas JSON reales de la API (apps/api).
 * Las fechas llegan siempre como strings ISO 8601.
 */

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Business {
  id: string;
  userId: string;
  name: string;
  type: string;
  location: string;
  currency: string;
  startDate: string;
  isSeasonal: boolean;
  seasonStart: string | null;
  seasonEnd: string | null;
  thresholds: number[];
  createdAt: string;
  updatedAt: string;
}

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
  createdAt: string;
  updatedAt: string;
}

export interface DailyRecord {
  id: string;
  businessId: string;
  date: string;
  revenue: number;
  tickets: number;
  averageTicket: number;
  weather: string | null;
  tempMax: number | null;
  tempMin: number | null;
  rain: string | null;
  wind: string | null;
  event: string | null;
  campaign: string | null;
  socialFollowers: number | null;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DayHighlight {
  date: string;
  revenue: number;
}

export interface BusinessMetrics {
  id: string;
  businessId: string;
  totalRevenue: number;
  averageDailyRevenue: number;
  totalTickets: number;
  globalAverageTicket: number;
  bestDay: DayHighlight | null;
  worstDay: DayHighlight | null;
  recordsCount: number;
  recentTrend: number;
  updatedAt: string;
}

export interface ImportCsvSummary {
  imported: number;
  ignored: number;
  errors: { line: number; message: string }[];
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: { path: string; message: string }[];
  };
}

export const WEATHER_OPTIONS = [
  'soleado',
  'parcialmente-nublado',
  'nublado',
  'lluvia',
  'tormenta',
] as const;

export const BUSINESS_TYPE_OPTIONS = [
  'chiringuito',
  'cafeteria',
  'food-truck',
  'restaurante',
  'tienda',
  'heladeria',
  'terraza',
  'otro',
] as const;

export const DEFAULT_THRESHOLDS = [100, 200, 300, 500, 1000];
