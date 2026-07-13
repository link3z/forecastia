import { Router } from 'express';

import {
  createBusiness,
  getBusiness,
  getPredictiveVariables,
  listBusinesses,
  updateBusiness,
  updatePredictiveVariables,
} from '../controllers/business.controller.js';
import {
  createDailyRecord,
  importCsv,
  listDailyRecords,
  updateDailyRecord,
} from '../controllers/daily-record.controller.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const businessRouter = Router();

businessRouter.use(authMiddleware);

businessRouter.post('/', asyncHandler(createBusiness));
businessRouter.get('/', asyncHandler(listBusinesses));
businessRouter.get('/:id', asyncHandler(getBusiness));
businessRouter.put('/:id', asyncHandler(updateBusiness));
businessRouter.get('/:id/predictive-variables', asyncHandler(getPredictiveVariables));
businessRouter.put('/:id/predictive-variables', asyncHandler(updatePredictiveVariables));

businessRouter.post('/:businessId/daily-records', asyncHandler(createDailyRecord));
businessRouter.get('/:businessId/daily-records', asyncHandler(listDailyRecords));
businessRouter.put('/:businessId/daily-records/:recordId', asyncHandler(updateDailyRecord));
businessRouter.post('/:businessId/import-csv', asyncHandler(importCsv));
