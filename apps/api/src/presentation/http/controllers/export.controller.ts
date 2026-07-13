import type { Request, Response } from 'express';

import { ExportCsvUseCase } from '../../../application/use-cases/exports/ExportCsvUseCase.js';
import { ExportJsonUseCase } from '../../../application/use-cases/exports/ExportJsonUseCase.js';
import { ExportMarkdownReportUseCase } from '../../../application/use-cases/exports/ExportMarkdownReportUseCase.js';
import {
  businessMetricsRepository,
  businessRepository,
  dailyRecordRepository,
  forecastRepository,
} from '../../../infrastructure/repositories/index.js';

// ── GET /businesses/:businessId/export/csv ────────────────────────────────────

export async function exportCsv(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { businessId } = req.params;
  const target = req.query['target'] === 'metrics' ? 'metrics' : 'records';

  const useCase = new ExportCsvUseCase(
    businessRepository,
    dailyRecordRepository,
    businessMetricsRepository,
  );

  const { content, filename } = await useCase.execute(userId, businessId, target);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send('﻿' + content); // BOM para compatibilidad con Excel en Windows
}

// ── GET /businesses/:businessId/export/json ───────────────────────────────────

export async function exportJson(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { businessId } = req.params;

  const useCase = new ExportJsonUseCase(
    businessRepository,
    dailyRecordRepository,
    businessMetricsRepository,
    forecastRepository,
  );

  const { content, filename } = await useCase.execute(userId, businessId);

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(content);
}

// ── GET /businesses/:businessId/export/report.md ─────────────────────────────

export async function exportMarkdownReport(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { businessId } = req.params;

  const useCase = new ExportMarkdownReportUseCase(
    businessRepository,
    dailyRecordRepository,
    businessMetricsRepository,
    forecastRepository,
  );

  const { content, filename } = await useCase.execute(userId, businessId);

  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(content);
}
