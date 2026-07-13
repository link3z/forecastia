import { buildDailyRecordData } from '../../../domain/entities/DailyRecord.js';
import type { DailyRecordRepository } from '../../../domain/repositories/DailyRecordRepository.js';
import type { ImportCsvInput } from '../../dtos/daily-record.dto.js';
import type { RecalibrateBusinessMetricsUseCase } from '../metrics/RecalibrateBusinessMetricsUseCase.js';
import { parseDailyRecordsCsv, type CsvRowError } from './parseDailyRecordsCsv.js';

export interface ImportCsvSummary {
  imported: number;
  ignored: number;
  errors: CsvRowError[];
}

/**
 * CU-004 — Importar histórico desde CSV.
 * Valida cada línea, informa de filas correctas/ignoradas/erróneas y permite
 * elegir entre ignorar o sobrescribir cuando la fecha ya existe.
 */
export class ImportCsvUseCase {
  constructor(
    private readonly dailyRecordRepository: DailyRecordRepository,
    private readonly recalibrateUseCase: RecalibrateBusinessMetricsUseCase,
  ) {}

  async execute(businessId: string, input: ImportCsvInput): Promise<ImportCsvSummary> {
    const { rows, errors } = parseDailyRecordsCsv(input.csvContent);

    let imported = 0;
    let ignored = 0;
    const rowErrors: CsvRowError[] = [...errors];

    for (const row of rows) {
      try {
        const existing = await this.dailyRecordRepository.findByBusinessAndDate(
          businessId,
          row.date,
        );

        const data = buildDailyRecordData({
          businessId,
          date: row.date,
          revenue: row.revenue,
          tickets: row.tickets,
          averageTicket: row.averageTicket,
          weather: row.weather,
          tempMax: row.tempMax,
          tempMin: row.tempMin,
          rain: row.rain,
          wind: row.wind,
          event: row.event,
          campaign: row.campaign,
          socialFollowers: row.socialFollowers,
          observations: row.observations,
        });

        if (existing) {
          if (input.conflictStrategy === 'ignore') {
            ignored += 1;
            continue;
          }
          await this.dailyRecordRepository.update(existing.id, data);
          imported += 1;
        } else {
          await this.dailyRecordRepository.create(data);
          imported += 1;
        }
      } catch (error) {
        rowErrors.push({
          line: row.line,
          message: error instanceof Error ? error.message : 'Error desconocido al importar la fila.',
        });
      }
    }

    if (imported > 0) {
      await this.recalibrateUseCase.execute(businessId);
    }

    return { imported, ignored, errors: rowErrors };
  }
}
