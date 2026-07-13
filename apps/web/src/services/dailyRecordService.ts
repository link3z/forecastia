import { apiClient } from './apiClient';
import type { DailyRecord, ImportCsvSummary } from '../types/api';

export interface CreateDailyRecordInput {
  date: string;
  revenue: number;
  tickets: number;
  averageTicket?: number | null;
  weather?: string | null;
  tempMax?: number | null;
  tempMin?: number | null;
  rain?: string | null;
  wind?: string | null;
  event?: string | null;
  campaign?: string | null;
  socialFollowers?: number | null;
  observations?: string | null;
}

export type UpdateDailyRecordInput = Partial<CreateDailyRecordInput>;

export async function listDailyRecords(businessId: string): Promise<{ records: DailyRecord[] }> {
  const { data } = await apiClient.get(`/businesses/${businessId}/daily-records`);
  return data;
}

export async function createDailyRecord(
  businessId: string,
  input: CreateDailyRecordInput,
): Promise<{ record: DailyRecord }> {
  const { data } = await apiClient.post(`/businesses/${businessId}/daily-records`, input);
  return data;
}

export async function updateDailyRecord(
  businessId: string,
  recordId: string,
  input: UpdateDailyRecordInput,
): Promise<{ record: DailyRecord }> {
  const { data } = await apiClient.put(
    `/businesses/${businessId}/daily-records/${recordId}`,
    input,
  );
  return data;
}

export async function importDailyRecordsCsv(
  businessId: string,
  csvContent: string,
  conflictStrategy: 'ignore' | 'overwrite',
): Promise<{ summary: ImportCsvSummary }> {
  const { data } = await apiClient.post(`/businesses/${businessId}/import-csv`, {
    csvContent,
    conflictStrategy,
  });
  return data;
}
