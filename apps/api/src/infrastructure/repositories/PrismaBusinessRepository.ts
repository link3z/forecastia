import type { Business as PrismaBusiness, PrismaClient } from '@prisma/client';

import type { Business, BusinessUpdate, NewBusiness } from '../../domain/entities/Business.js';
import type { BusinessRepository } from '../../domain/repositories/BusinessRepository.js';

export class PrismaBusinessRepository implements BusinessRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: NewBusiness): Promise<Business> {
    const created = await this.prisma.business.create({
      data: {
        userId: data.userId,
        name: data.name,
        type: data.type,
        location: data.location,
        currency: data.currency,
        startDate: data.startDate,
        isSeasonal: data.isSeasonal,
        seasonStart: data.seasonStart,
        seasonEnd: data.seasonEnd,
        thresholds: data.thresholds,
      },
    });
    return toDomain(created);
  }

  async findById(id: string): Promise<Business | null> {
    const found = await this.prisma.business.findUnique({ where: { id } });
    return found ? toDomain(found) : null;
  }

  async findAllByUser(userId: string): Promise<Business[]> {
    const found = await this.prisma.business.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return found.map(toDomain);
  }

  async update(id: string, data: BusinessUpdate): Promise<Business> {
    const updated = await this.prisma.business.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.isSeasonal !== undefined && { isSeasonal: data.isSeasonal }),
        ...(data.seasonStart !== undefined && { seasonStart: data.seasonStart }),
        ...(data.seasonEnd !== undefined && { seasonEnd: data.seasonEnd }),
        ...(data.thresholds !== undefined && { thresholds: data.thresholds }),
      },
    });
    return toDomain(updated);
  }
}

function toDomain(record: PrismaBusiness): Business {
  return {
    id: record.id,
    userId: record.userId,
    name: record.name,
    type: record.type,
    location: record.location,
    currency: record.currency,
    startDate: record.startDate,
    isSeasonal: record.isSeasonal,
    seasonStart: record.seasonStart,
    seasonEnd: record.seasonEnd,
    thresholds: record.thresholds as number[],
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
