import type { Request, Response } from 'express';

import { GenerateForecastSchema } from '../../../application/dtos/forecast.dto.js';
import { GenerateForecastUseCase } from '../../../application/use-cases/forecasts/GenerateForecastUseCase.js';
import { GetForecastsUseCase } from '../../../application/use-cases/forecasts/GetForecastsUseCase.js';
import { DomainValidationError } from '../../../domain/errors/AppError.js';
import {
  businessRepository,
  dailyRecordRepository,
  forecastRepository,
  predictiveVariableConfigRepository,
} from '../../../infrastructure/repositories/index.js';
import { createExplanationService } from '../../../infrastructure/ai/ExplanationServiceFactory.js';

// Instancia única del servicio de explicación (decide en tiempo de ejecución según .env)
const explanationService = createExplanationService();

export async function generateForecast(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { businessId } = req.params;

  const parsed = GenerateForecastSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new DomainValidationError(parsed.error.errors.map((e) => e.message).join(', '));
  }

  const useCase = new GenerateForecastUseCase(
    businessRepository,
    dailyRecordRepository,
    predictiveVariableConfigRepository,
    forecastRepository,
    explanationService,
  );

  const forecast = await useCase.execute(userId, businessId, parsed.data);
  res.status(201).json({ forecast });
}

export async function listForecasts(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { businessId } = req.params;

  const useCase = new GetForecastsUseCase(businessRepository, forecastRepository);
  const forecasts = await useCase.execute(userId, businessId);
  res.json({ forecasts });
}
