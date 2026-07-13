import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';

const { mockUserRepo, mockBusinessRepo, mockConfigRepo, mockMetricsRepo } = vi.hoisted(() => ({
  mockUserRepo: { findByEmail: vi.fn(), findById: vi.fn(), create: vi.fn() },
  mockBusinessRepo: {
    create: vi.fn(),
    findById: vi.fn(),
    findAllByUser: vi.fn(),
    update: vi.fn(),
  },
  mockConfigRepo: {
    findByBusinessId: vi.fn(),
    create: vi.fn(),   // CreateBusinessUseCase calls .create()
    upsert: vi.fn(),
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
  predictiveVariableConfigRepository: mockConfigRepo,
  dailyRecordRepository: { findAllByBusiness: vi.fn().mockResolvedValue([]) },
  businessMetricsRepository: mockMetricsRepo,
  forecastRepository: {},
}));

import { createApp } from '../../app.js';
import { makeUser, makeBusiness } from '../helpers/factories.js';

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

describe('POST /api/businesses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restaurar auth mock borrado por clearAllMocks
    mockUserRepo.findByEmail.mockResolvedValue(
      makeUser({ passwordHash: 'hashed:Password1!' }),
    );
  });

  it('crea un negocio correctamente', async () => {
    const biz = makeBusiness();
    mockBusinessRepo.create.mockResolvedValue(biz);
    mockConfigRepo.create.mockResolvedValue({ id: 'cfg-1', businessId: biz.id });

    const res = await request(app)
      .post('/api/businesses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Chiringuito Test',
        type: 'chiringuito',
        location: 'Playa Test',
        currency: 'EUR',
        startDate: '2024-01-01',
        isSeasonal: false,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('business');
  });

  it('valida campos requeridos (400)', async () => {
    const res = await request(app)
      .post('/api/businesses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Sin tipo' });

    expect(res.status).toBe(400);
  });

  it('requiere autenticación (401)', async () => {
    const res = await request(app).post('/api/businesses').send({ name: 'Test' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/businesses', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve la lista de negocios del usuario', async () => {
    mockBusinessRepo.findAllByUser.mockResolvedValue([makeBusiness()]);

    const res = await request(app)
      .get('/api/businesses')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.businesses)).toBe(true);
    expect(res.body.businesses.length).toBe(1);
  });
});

describe('GET /api/businesses/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve el negocio si pertenece al usuario', async () => {
    mockBusinessRepo.findById.mockResolvedValue(makeBusiness({ userId: 'user-1' }));
    mockConfigRepo.findByBusinessId.mockResolvedValue(null);
    mockMetricsRepo.findByBusinessId.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/businesses/biz-1')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.business.id).toBe('biz-1');
  });

  it('devuelve 404 si no existe el negocio', async () => {
    mockBusinessRepo.findById.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/businesses/no-existe')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
  });
});
