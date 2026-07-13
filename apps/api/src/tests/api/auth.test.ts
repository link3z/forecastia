import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

const { mockUserRepo } = vi.hoisted(() => ({
  mockUserRepo: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  },
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
  businessRepository: {},
  predictiveVariableConfigRepository: {},
  dailyRecordRepository: {},
  businessMetricsRepository: {},
  forecastRepository: {},
}));

import { createApp } from '../../app.js';
import { makeUser } from '../helpers/factories.js';

const app = createApp();

describe('POST /api/auth/register', () => {
  beforeEach(() => vi.clearAllMocks());

  it('registra un usuario nuevo y devuelve el usuario', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockUserRepo.create.mockResolvedValue(makeUser());

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@example.com', password: 'Password1!' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
  });

  it('rechaza si el email ya existe (409)', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(makeUser());

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@example.com', password: 'Password1!' });

    expect(res.status).toBe(409);
  });

  it('valida campos requeridos (400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com' }); // falta name y password

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve token con credenciales correctas', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(
      makeUser({ passwordHash: 'hashed:Password1!' }),
    );

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Password1!' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('rechaza contraseña incorrecta (401)', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(
      makeUser({ passwordHash: 'hashed:OtherPass!' }),
    );

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'WrongPass!' });

    expect(res.status).toBe(401);
  });

  it('rechaza usuario inexistente (401)', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'no@existe.com', password: 'Password1!' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('devuelve usuario autenticado con token válido', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(
      makeUser({ passwordHash: 'hashed:Password1!' }),
    );
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Password1!' });
    const { token } = loginRes.body as { token: string };

    mockUserRepo.findById.mockResolvedValue(makeUser());

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('rechaza petición sin token (401)', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
