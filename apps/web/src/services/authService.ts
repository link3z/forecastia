import { apiClient } from './apiClient';
import type { AuthUser } from '../types/api';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export async function login(input: LoginInput): Promise<{ token: string; user: AuthUser }> {
  const { data } = await apiClient.post('/auth/login', input);
  return data;
}

export async function register(input: RegisterInput): Promise<{ user: AuthUser }> {
  const { data } = await apiClient.post('/auth/register', input);
  return data;
}

export async function getCurrentUser(): Promise<{ user: AuthUser }> {
  const { data } = await apiClient.get('/auth/me');
  return data;
}
