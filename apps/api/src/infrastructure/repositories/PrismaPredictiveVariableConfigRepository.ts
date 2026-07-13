import type {
  PredictiveVariableConfig as PrismaConfig,
  PrismaClient,
} from '@prisma/client';

import type {
  NewPredictiveVariableConfig,
  PredictiveVariableConfig,
  PredictiveVariableConfigUpdate,
} from '../../domain/entities/PredictiveVariableConfig.js';
import type { PredictiveVariableConfigRepository } from '../../domain/repositories/PredictiveVariableConfigRepository.js';

export class PrismaPredictiveVariableConfigRepository
  implements PredictiveVariableConfigRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: NewPredictiveVariableConfig): Promise<PredictiveVariableConfig> {
    const created = await this.prisma.predictiveVariableConfig.create({ data });
    return toDomain(created);
  }

  async findByBusinessId(businessId: string): Promise<PredictiveVariableConfig | null> {
    const found = await this.prisma.predictiveVariableConfig.findUnique({
      where: { businessId },
    });
    return found ? toDomain(found) : null;
  }

  async update(
    businessId: string,
    data: PredictiveVariableConfigUpdate,
  ): Promise<PredictiveVariableConfig> {
    const updated = await this.prisma.predictiveVariableConfig.update({
      where: { businessId },
      data,
    });
    return toDomain(updated);
  }
}

function toDomain(record: PrismaConfig): PredictiveVariableConfig {
  return { ...record };
}
