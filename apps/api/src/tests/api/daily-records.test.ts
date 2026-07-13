import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';

const { mockUserRepo, mockBusinessRepo, mockRecordRepo, mockMetricsRepo } = vi.hoisted(() => ({
  mockUserRepo: { findByEmail: vi.fn(), findById: vi.fn(), create: vi.fn() },
  mockBusinessRepo: { findById: vi.fn() },
  mockRecordRepo: {
    findByBusinessAndDate: vi.fn(),
    create: vi.fn(),
    findAllByBusiness: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
  },
  mockMetricsRepo: { findByBusinessId: vi.fn(), upsert: vi.fn() },
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: async (p: string) => `hashed:${p}`,
    compare: async (p: string, h: string) => h === `hashed:${p}`,
  },
  hash: async (p: string) => `hashed:${p}`,
  compare: async (p: string, h: string) => h === `hashed:${p}`,
}));

vi.mock('../../infrastructure/repositories/index.js', () => ({
  userRepository: mockUserRepo,
  businessRepository: mockBusinessRepo,
  predictiveVariableConfigRepository: {},
  dailyRecordRepository: mockRecordRepo,
  businessMetricsRepository: mockMetricsRepo,
  forecastRepository: {},
}));

import { createApp } from '../../app.js';
import { makeUser, makeBusiness, makeRecord } from '../helpers/factories.js';

const app = createApp();
let authToken: string;

beforeAll(async () => {
  mockUserRepo.findByEmail.mockResolvedValue(
    makeUser({ passwordHash: 'hashed:Password1!' }),
  );
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@example.com', password: 'Password1!' });
  authToken = (res.body as { token: string }).token;
});

describe('POST /api/businesses/:businessId/daily-records', () => {
  beforeEach(() => vi.clearAllMocks());

  it('crea un cierre diario correctamente', async () => {
    mockBusinessRepo.findById.mockResolvedValue(makeBusiness());
    mockRecordRepo.findByBusinessAndDate.mockResolvedValue(null);
    mockRecordRepo.create.mockResolvedValue(makeRecord());
    mockRecordRepo.findAllByBusiness.mockResolvedValue([makeRecord()]);
    mockMetricsRepo.upsert.mockResolvedValue({});

    const res = await request(app)
      .post('/api/businesses/biz-1/daily-records')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ date: '2024-06-15', revenue: 350, tickets: 35, weather: 'soleado' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('record');
  });

  it('rechaza caja negativa (400)', async () => {
    mockBusinessRepo.findById.mockResolvedValue(makeBusiness());

    const res = await request(app)
      .post('/api/businesses/biz-1/daily-records')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ date: '2024-06-15', revenue: -100, tickets: 10 });

    expect(res.status).toBe(400);
  });

  it('rechaza duplicado en la misma fecha (409)', async () => {
    mockBusinessRepo.findById.mockResolvedValue(makeBusiness());
    mockRecordRepo.findByBusinessAndDate.mockResolvedValue(makeRecord());

    const res = await request(app)
      .post('/api/businesses/biz-1/daily-records')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ date: '2024-06-15', revenue: 350, tickets: 35 });

    expect(res.status).toBe(409);
  });
});

describe('GET /api/businesses/:businessId/daily-records', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve lista de cierres', async () => {
    mockBusinessRepo.findById.mockResolvedValue(makeBusiness());
    mockRecordRepo.findAllByBusiness.mockResolvedValue([makeRecord(), makeRecord()]);

    const res = await request(app)
      .get('/api/businesses/biz-1/daily-records')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.records)).toBe(true);
    expect(res.body.records.length).toBe(2);
  });
});
