import type { Business, BusinessUpdate, NewBusiness } from '../entities/Business.js';

export interface BusinessRepository {
  create(data: NewBusiness): Promise<Business>;
  findById(id: string): Promise<Business | null>;
  findAllByUser(userId: string): Promise<Business[]>;
  update(id: string, data: BusinessUpdate): Promise<Business>;
}
