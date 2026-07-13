import type { User } from '../../domain/entities/User.js';
import type { Business } from '../../domain/entities/Business.js';
import type { DailyRecord } from '../../domain/entities/DailyRecord.js';

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    passwordHash: '$2b$10$AAAAAAAAAAAAAAAAAAAAAO5CDvSBvhNAerLBo27lLOmSA4qxaHbH2',
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}

export function makeBusiness(overrides: Partial<Business> = {}): Business {
  return {
    id: 'biz-1',
    userId: 'user-1',
    name: 'Test Business',
    type: 'chiringuito',
    location: 'Test Location',
    currency: 'EUR',
    startDate: new Date('2024-01-01'),
    isSeasonal: false,
    seasonStart: null,
    seasonEnd: null,
    thresholds: [100, 200, 300, 500, 1000],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

export function makeRecord(overrides: Partial<DailyRecord> = {}): DailyRecord {
  return {
    id: 'rec-1',
    businessId: 'biz-1',
    date: new Date('2024-06-15'),
    revenue: 350,
    tickets: 35,
    averageTicket: 10,
    weather: 'soleado',
    tempMax: 32,
    tempMin: 22,
    rain: null,
    wind: 'suave',
    event: null,
    campaign: null,
    socialFollowers: null,
    observations: null,
    createdAt: new Date('2024-06-15'),
    updatedAt: new Date('2024-06-15'),
    ...overrides,
  };
}
