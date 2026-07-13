import type { Request, Response } from 'express';

import {
  CreateBusinessSchema,
  UpdateBusinessSchema,
  UpdatePredictiveVariablesSchema,
} from '../../../application/dtos/business.dto.js';
import { CreateBusinessUseCase } from '../../../application/use-cases/businesses/CreateBusinessUseCase.js';
import { GetBusinessUseCase } from '../../../application/use-cases/businesses/GetBusinessUseCase.js';
import { GetPredictiveVariablesUseCase } from '../../../application/use-cases/businesses/GetPredictiveVariablesUseCase.js';
import { ListBusinessesUseCase } from '../../../application/use-cases/businesses/ListBusinessesUseCase.js';
import { UpdateBusinessUseCase } from '../../../application/use-cases/businesses/UpdateBusinessUseCase.js';
import { UpdatePredictiveVariablesUseCase } from '../../../application/use-cases/businesses/UpdatePredictiveVariablesUseCase.js';
import {
  businessRepository,
  predictiveVariableConfigRepository,
} from '../../../infrastructure/repositories/index.js';

export async function createBusiness(req: Request, res: Response): Promise<void> {
  const input = CreateBusinessSchema.parse(req.body);
  const useCase = new CreateBusinessUseCase(businessRepository, predictiveVariableConfigRepository);
  const result = await useCase.execute(req.userId!, input);
  res.status(201).json(result);
}

export async function listBusinesses(req: Request, res: Response): Promise<void> {
  const useCase = new ListBusinessesUseCase(businessRepository);
  const businesses = await useCase.execute(req.userId!);
  res.status(200).json({ businesses });
}

export async function getBusiness(req: Request, res: Response): Promise<void> {
  const useCase = new GetBusinessUseCase(businessRepository);
  const business = await useCase.execute(req.userId!, req.params.id);
  res.status(200).json({ business });
}

export async function updateBusiness(req: Request, res: Response): Promise<void> {
  const input = UpdateBusinessSchema.parse(req.body);
  const useCase = new UpdateBusinessUseCase(businessRepository);
  const business = await useCase.execute(req.userId!, req.params.id, input);
  res.status(200).json({ business });
}

export async function getPredictiveVariables(req: Request, res: Response): Promise<void> {
  const useCase = new GetPredictiveVariablesUseCase(
    businessRepository,
    predictiveVariableConfigRepository,
  );
  const predictiveVariableConfig = await useCase.execute(req.userId!, req.params.id);
  res.status(200).json({ predictiveVariableConfig });
}

export async function updatePredictiveVariables(req: Request, res: Response): Promise<void> {
  const input = UpdatePredictiveVariablesSchema.parse(req.body);
  const useCase = new UpdatePredictiveVariablesUseCase(
    businessRepository,
    predictiveVariableConfigRepository,
  );
  const config = await useCase.execute(req.userId!, req.params.id, input);
  res.status(200).json({ predictiveVariableConfig: config });
}
