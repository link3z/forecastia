import type { BusinessMetrics, BusinessMetricsSnapshot } from '../entities/BusinessMetrics.js';

export interface BusinessMetricsRepository {
  findByBusinessId(businessId: string): Promise<BusinessMetrics | null>;
  upsert(businessId: string, snapshot: BusinessMetricsSnapshot): Promise<BusinessMetrics>;
}
