import type { DailyRecord as PrismaDailyRecord, PrismaClient } from '@prisma/client';

import type { DailyRecord, NewDailyRecord } from '../../domain/entities/DailyRecord.js';
import type { DailyRecordRepository } from '../../domain/repositories/DailyRecordRepository.js';

export class PrismaDailyRecordRepository implements DailyRecordRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: NewDailyRecord): Promise<DailyRecord> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created = await this.prisma.dailyRecord.create({ data: toPersistence(data) as any });
    return toDomain(created);
  }

  async update(id: string, data: Partial<NewDailyRecord>): Promise<DailyRecord> {
    const updated = await this.prisma.dailyRecord.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: toPersistence(data) as any,
    });
    return toDomain(updated);
  }

  async findById(id: string): Promise<DailyRecord | null> {
    const found = await this.prisma.dailyRecord.findUnique({ where: { id } });
    return found ? toDomain(found) : null;
  }

  async findByBusinessAndDate(businessId: string, date: Date): Promise<DailyRecord | null> {
    const found = await this.prisma.dailyRecord.findUnique({
      where: { businessId_date: { businessId, date: normalizeDate(date) } },
    });
    return found ? toDomain(found) : null;
  }

  async findAllByBusiness(businessId: string): Promise<DailyRecord[]> {
    const found = await this.prisma.dailyRecord.findMany({
      where: { businessId },
      orderBy: { date: 'asc' },
    });
    return found.map(toDomain);
  }
}

function normalizeDate(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function toPersistence(data: Partial<NewDailyRecord>) {
  return {
    ...(data.businessId !== undefined && { businessId: data.businessId }),
    ...(data.date !== undefined && { date: normalizeDate(data.date) }),
    ...(data.revenue !== undefined && { revenue: data.revenue }),
    ...(data.tickets !== undefined && { tickets: data.tickets }),
    ...(data.averageTicket !== undefined && { averageTicket: data.averageTicket }),
    ...(data.weather !== undefined && { weather: data.weather }),
    ...(data.tempMax !== undefined && { tempMax: data.tempMax }),
    ...(data.tempMin !== undefined && { tempMin: data.tempMin }),
    ...(data.rain !== undefined && { rain: data.rain }),
    ...(data.wind !== undefined && { wind: data.wind }),
    ...(data.event !== undefined && { event: data.event }),
    ...(data.campaign !== undefined && { campaign: data.campaign }),
    ...(data.socialFollowers !== undefined && { socialFollowers: data.socialFollowers }),
    ...(data.observations !== undefined && { observations: data.observations }),
  };
}

function toDomain(record: PrismaDailyRecord): DailyRecord {
  return {
    id: record.id,
    businessId: record.businessId,
    date: record.date,
    revenue: Number(record.revenue),
    tickets: record.tickets,
    averageTicket: Number(record.averageTicket),
    weather: record.weather,
    tempMax: record.tempMax !== null ? Number(record.tempMax) : null,
    tempMin: record.tempMin !== null ? Number(record.tempMin) : null,
    rain: record.rain,
    wind: record.wind,
    event: record.event,
    campaign: record.campaign,
    socialFollowers: record.socialFollowers,
    observations: record.observations,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
