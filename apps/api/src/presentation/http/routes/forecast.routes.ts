import { Router } from 'express';

import { generateForecast, listForecasts } from '../controllers/forecast.controller.js';
import {
  getDashboardComparisons,
  getDashboardEvolution,
  getDashboardMetrics,
} from '../controllers/dashboard.controller.js';
import {
  exportCsv,
  exportJson,
  exportMarkdownReport,
} from '../controllers/export.controller.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

/**
 * Todas estas rutas se montan bajo /api/businesses/:businessId en index.ts.
 */
export const forecastAndDashboardRouter = Router({ mergeParams: true });

forecastAndDashboardRouter.use(authMiddleware);

// Predicciones (CU-009 / CU-010)
forecastAndDashboardRouter.post('/forecasts', asyncHandler(generateForecast));
forecastAndDashboardRouter.get('/forecasts', asyncHandler(listForecasts));

// Dashboard (CU-006 / CU-007 / CU-008)
forecastAndDashboardRouter.get('/dashboard/evolution', asyncHandler(getDashboardEvolution));
forecastAndDashboardRouter.get('/dashboard/metrics', asyncHandler(getDashboardMetrics));
forecastAndDashboardRouter.get('/dashboard/comparisons', asyncHandler(getDashboardComparisons));

// Exportaciones (CU-017 / CU-018)
forecastAndDashboardRouter.get('/export/csv', asyncHandler(exportCsv));
forecastAndDashboardRouter.get('/export/json', asyncHandler(exportJson));
forecastAndDashboardRouter.get('/export/report.md', asyncHandler(exportMarkdownReport));
