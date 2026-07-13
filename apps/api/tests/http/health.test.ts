import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.js';

describe('GET /api/health', () => {
  it('responde 200 con estado ok', async () => {
    const app = createApp();
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
