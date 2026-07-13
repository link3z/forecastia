export interface Business {
  id: string;
  userId: string;
  name: string;
  type: string;
  location: string;
  currency: string;
  startDate: Date;
  isSeasonal: boolean;
  seasonStart: Date | null;
  seasonEnd: Date | null;
  thresholds: number[];
  createdAt: Date;
  updatedAt: Date;
}

export type NewBusiness = Omit<Business, 'id' | 'createdAt' | 'updatedAt'>;
export type BusinessUpdate = Partial<
  Omit<Business, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>;

export const DEFAULT_BUSINESS_THRESHOLDS: number[] = [100, 200, 300, 500, 1000];
