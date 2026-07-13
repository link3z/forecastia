import { apiClient } from './apiClient';
import type { Business, PredictiveVariableConfig } from '../types/api';

export interface CreateBusinessInput {
  name: string;
  type: string;
  location: string;
  currency: string;
  startDate: string;
  isSeasonal: boolean;
  seasonStart?: string | null;
  seasonEnd?: string | null;
  thresholds: number[];
}

export type UpdatePredictiveVariablesInput = Partial<
  Omit<PredictiveVariableConfig, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>
>;

export async function listBusinesses(): Promise<{ businesses: Business[] }> {
  const { data } = await apiClient.get('/businesses');
  return data;
}

export async function getBusiness(id: string): Promise<{ business: Business }> {
  const { data } = await apiClient.get(`/businesses/${id}`);
  return data;
}

export async function createBusiness(
  input: CreateBusinessInput,
): Promise<{ business: Business; predictiveVariableConfig: PredictiveVariableConfig }> {
  const { data } = await apiClient.post('/businesses', input);
  return data;
}

export async function getPredictiveVariables(
  businessId: string,
): Promise<{ predictiveVariableConfig: PredictiveVariableConfig }> {
  const { data } = await apiClient.get(`/businesses/${businessId}/predictive-variables`);
  return data;
}

export async function updatePredictiveVariables(
  businessId: string,
  input: UpdatePredictiveVariablesInput,
): Promise<{ predictiveVariableConfig: PredictiveVariableConfig }> {
  const { data } = await apiClient.put(`/businesses/${businessId}/predictive-variables`, input);
  return data;
}
