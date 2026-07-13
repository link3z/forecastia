import type { Request, Response } from 'express';

import {
  CreateDailyRecordSchema,
  ImportCsvSchema,
  UpdateDailyRecordSchema,
} from '../../../application/dtos/daily-record.dto.js';
import { GetBusinessUseCase } from '../../../application/use-cases/businesses/GetBusinessUseCase.js';
import { CreateDailyRecordUseCase } from '../../../application/use-cases/daily-records/CreateDailyRecordUseCase.js';
import { ImportCsvUseCase } from '../../../application/use-cases/daily-records/ImportCsvUseCase.js';
import { ListDailyRecordsUseCase } from '../../../application/use-cases/daily-records/ListDailyRecordsUseCase.js';
import { UpdateDailyRecordUseCase } from '../../../application/use-cases/daily-records/UpdateDailyRecordUseCase.js';
import { RecalibrateBusinessMetricsUseCase } from '../../../application/use-cases/metrics/RecalibrateBusinessMetricsUseCase.js';
import {
  businessMetricsRepository,
  businessRepository,
  dailyRecordRepository,
} from '../../../infrastructure/repositories/index.js';

async function assertBusinessOwnership(userId: string, businessId: string) {
  const useCase = new GetBusinessUseCase(businessRepository);
  await useCase.execute(userId, businessId);
}

function recalibrateUseCase() {
  return new RecalibrateBusinessMetricsUseCase(dailyRecordRepository, businessMetricsRepository);
}

export async function createDailyRecord(req: Request, res: Response): Promise<void> {
  await assertBusinessOwnership(req.userId!, req.params.businessId);
  const input = CreateDailyRecordSchema.parse(req.body);
  const useCase = new CreateDailyRecordUseCase(dailyRecordRepository, recalibrateUseCase());
  const record = await useCase.execute(req.params.businessId, input);
  res.status(201).json({ record });
}

export async function listDailyRecords(req: Request, res: Response): Promise<void> {
  await assertBusinessOwnership(req.userId!, req.params.businessId);
  const useCase = new ListDailyRecordsUseCase(dailyRecordRepository);
  const records = await useCase.execute(req.params.businessId);
  res.status(200).json({ records });
}

export async function updateDailyRecord(req: Request, res: Response): Promise<void> {
  await assertBusinessOwnership(req.userId!, req.params.businessId);
  const input = UpdateDailyRecordSchema.parse(req.body);
  const useCase = new UpdateDailyRecordUseCase(dailyRecordRepository, recalibrateUseCase());
  const record = await useCase.execute(req.params.businessId, req.params.recordId, input);
  res.status(200).json({ record });
}

export async function importCsv(req: Request, res: Response): Promise<void> {
  await assertBusinessOwnership(req.userId!, req.params.businessId);
  const input = ImportCsvSchema.parse(req.body);
  const useCase = new ImportCsvUseCase(dailyRecordRepository, recalibrateUseCase());
  const summary = await useCase.execute(req.params.businessId, input);
  res.status(200).json({ summary });
}
