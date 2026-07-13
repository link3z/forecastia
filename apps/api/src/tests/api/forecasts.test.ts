import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';

const { mockUserRepo, mockBusinessRepo, mockRecordRepo, mockConfigRepo, mockForecastRepo } =
  vi.hoisted(() => ({
    mockUserRepo: { findByEmail: vi.fn(), findById: vi.fn(), create: vi.fn() },
    mockBusinessRepo: { findById: vi.fn() },
    mockRecordRepo: { findAllByBusiness: vi.fn() },
    mockConfigRepo: { findByBusinessId: vi.fn() },
    mockForecastRepo: { create: vi.fn(), findAllByBusiness: vi.fn() },
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
  predictiveVariableConfigRepository: mockConfigRepo,
  dailyRecordRepository: mockRecordRepo,
  businessMetricsRepository: {},
  forecastRepository: mockForecastRepo,
}));

vi.mock('../../infrastructure/ai/ExplanationServiceFactory.js', () => ({
  createExplanationService: () => ({
    explain: vi.fn().mockResolvedValue('Explicación generada localmente.'),
  }),
}));

import { createApp } from '../../app.js';
import { makeUser, makeBusiness, makeRecord } from '../helpers/factories.js';
import type { Forecast } from '../../domain/entities/Forecast.js';

const app = createApp();
let authToken: string;

const mockForecast: Forecast = {
  id: 'fc-1',
  businessId: 'biz-1',
  targetDate: new Date('2024-07-20'),
  expectedRevenue: 380,
  minRevenue: 250,
  maxRevenue: 510,
  pessimisticScenario: 250,
  averageScenario: 380,
  optimisticScenario: 510,
  probabilities: { '100': 0.95, '300': 0.7 },
  influencingFactors: [],
  aiExplanation: 'Explicación generada localmente.',
  inputVariables: { targetDate: '2024-07-20', weather: 'soleado' },
  createdAt: new Date(),
};

const mockConfig = {
  id: 'cfg-1', businessId: 'biz-1',
  useWeather: true, useTemperature: true, useRain: true,
  useWind: false, useEvents: true, useCampaigns: true,
  useSocialFollowers: false, useObservations: false,
  createdAt: new Date(), updatedAt: new Date(),
};

beforeAll(async () => {
  mockUserRepo.findByEmail.mockResolvedValue(
    makeUser({ passwordHash: 'hashed:Password1!' }),
  );
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@example.com', password: 'Password1!' });
  authToken = (res.body as { token: string }).token;
});

describe('POST /api/businesses/:businessId/forecasts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('genera una predicción para una fecha futura', async () => {
    mockBusinessRepo.findById.mockResolvedValue(makeBusiness());
    mockRecordRepo.findAllByBusiness.mockResolvedValue(
      Array.from({ length: 20 }, (_, i) =>
        makeRecord({ id: `r${i}`, revenue: 300 + i * 5 }),
      ),
    );
    mockConfigRepo.findByBusinessId.mockResolvedValue(mockConfig);
    mockForecastRepo.create.mockResolvedValue(mockForecast);

    const res = await request(app)
      .post('/api/businesses/biz-1/forecasts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ targetDate: '2024-07-20', weather: 'soleado', tempMax: 34 });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('forecast');
    expect(res.body.forecast.expectedRevenue).toBeGreaterThan(0);
  });

  it('valida que targetDate sea requerido (400)', async () => {
    const res = await request(app)
      .post('/api/businesses/biz-1/forecasts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ weather: 'soleado' }); // sin targetDate

    expect(res.status).toBe(400);
  });

  it('devuelve 404 si el negocio no existe', async () => {
    mockBusinessRepo.findById.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/businesses/biz-1/forecasts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ targetDate: '2024-07-20' });

    expect(res.status).toBe(404);
  });
});

describe('GET /api/businesses/:businessId/forecasts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve lista de predicciones', async () => {
    mockBusinessRepo.findById.mockResolvedValue(makeBusiness());
    mockForecastRepo.findAllByBusiness.mockResolvedValue([mockForecast]);

    const res = await request(app)
      .get('/api/businesses/biz-1/forecasts')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.forecasts)).toBe(true);
  });
});
