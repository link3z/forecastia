export interface DayHighlight {
  date: string; // ISO date (yyyy-mm-dd)
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
  recentTrend: number; // variación relativa entre los últimos registros y la media histórica
  updatedAt: Date;
}

export type BusinessMetricsSnapshot = Omit<BusinessMetrics, 'id' | 'updatedAt'>;
