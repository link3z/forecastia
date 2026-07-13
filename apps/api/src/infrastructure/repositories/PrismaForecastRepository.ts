import type { Forecast as PrismaForecast, PrismaClient } from '@prisma/client';

import type { Forecast, NewForecast, InfluencingFactor } from '../../domain/entities/Forecast.js';
import type { ForecastRepository } from '../../domain/repositories/ForecastRepository.js';

export class PrismaForecastRepository implements ForecastRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: NewForecast): Promise<Forecast> {
    const created = await this.prisma.forecast.create({
      data: {
        businessId: data.businessId,
        targetDate: data.targetDate,
        expectedRevenue: data.expectedRevenue,
        minRevenue: data.minRevenue,
        maxRevenue: data.maxRevenue,
        pessimisticScenario: data.pessimisticScenario,
        averageScenario: data.averageScenario,
        optimisticScenario: data.optimisticScenario,
        probabilities: data.probabilities as object,
        influencingFactors: data.influencingFactors as unknown as object,
        aiExplanation: data.aiExplanation,
        inputVariables: data.inputVariables as object,
      },
    });
    return toDomain(created);
  }

  async findAllByBusiness(businessId: string): Promise<Forecast[]> {
    const found = await this.prisma.forecast.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });
    return found.map(toDomain);
  }

  async findById(id: string): Promise<Forecast | null> {
    const found = await this.prisma.forecast.findUnique({ where: { id } });
    return found ? toDomain(found) : null;
  }
}

function toDomain(f: PrismaForecast): Forecast {
  return {
    id: f.id,
    businessId: f.businessId,
    targetDate: f.targetDate,
    expectedRevenue: Number(f.expectedRevenue),
    minRevenue: Number(f.minRevenue),
    maxRevenue: Number(f.maxRevenue),
    pessimisticScenario: Number(f.pessimisticScenario),
    averageScenario: Number(f.averageScenario),
    optimisticScenario: Number(f.optimisticScenario),
    probabilities: f.probabilities as Record<string, number>,
    influencingFactors: f.influencingFactors as unknown as InfluencingFactor[],
    aiExplanation: f.aiExplanation,
    inputVariables: f.inputVariables as Record<string, unknown>,
    createdAt: f.createdAt,
  };
}
