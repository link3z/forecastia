import { Router } from 'express';

import { authRouter } from './auth.routes.js';
import { businessRouter } from './business.routes.js';
import { forecastAndDashboardRouter } from './forecast.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/businesses', businessRouter);
// Rutas de predicción y dashboard montadas bajo /businesses/:businessId
apiRouter.use('/businesses/:businessId', forecastAndDashboardRouter);

// Las rutas de exports se añaden en la Fase 6.
