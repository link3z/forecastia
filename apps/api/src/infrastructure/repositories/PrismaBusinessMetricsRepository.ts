import type { BusinessMetrics as PrismaBusinessMetrics, PrismaClient } from '@prisma/client';

import type {
  BusinessMetrics,
  BusinessMetricsSnapshot,
} from '../../domain/entities/BusinessMetrics.js';
import type { BusinessMetricsRepository } from '../../domain/repositories/BusinessMetricsRepository.js';

export class PrismaBusinessMetricsRepository implements BusinessMetricsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByBusinessId(businessId: string): Promise<BusinessMetrics | null> {
    const found = await this.prisma.businessMetrics.findUnique({ where: { businessId } });
    return found ? toDomain(found) : null;
  }

  async upsert(businessId: string, snapshot: BusinessMetricsSnapshot): Promise<BusinessMetrics> {
    const data = {
      totalRevenue: snapshot.totalRevenue,
      averageDailyRevenue: snapshot.averageDailyRevenue,
      totalTickets: snapshot.totalTickets,
      globalAverageTicket: snapshot.globalAverageTicket,
      // Prisma's JSON field requires an index-signatured object; cast via unknown
      bestDay: (snapshot.bestDay ?? null) as unknown as object,
      worstDay: (snapshot.worstDay ?? null) as unknown as object,
      recordsCount: snapshot.recordsCount,
      recentTrend: snapshot.recentTrend,
    };

    const upserted = await this.prisma.businessMetrics.upsert({
      where: { businessId },
      create: { businessId, ...data },
      update: data,
    });
    return toDomain(upserted);
  }
}

function toDomain(record: PrismaBusinessMetrics): BusinessMetrics {
  return {
    id: record.id,
    businessId: record.businessId,
    totalRevenue: Number(record.totalRevenue),
    averageDailyRevenue: Number(record.averageDailyRevenue),
    totalTickets: record.totalTickets,
    globalAverageTicket: Number(record.globalAverageTicket),
    bestDay: record.bestDay as BusinessMetrics['bestDay'],
    worstDay: record.worstDay as BusinessMetrics['worstDay'],
    recordsCount: record.recordsCount,
    recentTrend: Number(record.recentTrend),
    updatedAt: record.updatedAt,
  };
}
