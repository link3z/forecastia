import cors from 'cors';
import express, { type Express } from 'express';

import { errorHandler } from './presentation/http/middlewares/errorHandler.js';
import { apiRouter } from './presentation/http/routes/index.js';

/**
 * Construye la aplicación Express. Se separa de server.ts para poder
 * importarla directamente en los tests de API (Supertest) sin levantar
 * un servidor HTTP real.
 */
export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? '*',
    }),
  );
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api', apiRouter);

  // Las rutas de dashboard, forecasts y exports se añaden en las Fases 4, 5 y 6.

  app.use(errorHandler);

  return app;
}
