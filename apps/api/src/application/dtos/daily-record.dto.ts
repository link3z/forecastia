import { z } from 'zod';

export const CreateDailyRecordSchema = z.object({
  date: z.coerce.date(),
  revenue: z.number().nonnegative(),
  tickets: z.number().int().nonnegative(),
  averageTicket: z.number().nonnegative().nullish(),
  weather: z.string().trim().min(1).nullish(),
  tempMax: z.number().nullish(),
  tempMin: z.number().nullish(),
  rain: z.string().trim().min(1).nullish(),
  wind: z.string().trim().min(1).nullish(),
  event: z.string().trim().min(1).nullish(),
  campaign: z.string().trim().min(1).nullish(),
  socialFollowers: z.number().int().nonnegative().nullish(),
  observations: z.string().trim().max(2000).nullish(),
});
export type CreateDailyRecordInput = z.infer<typeof CreateDailyRecordSchema>;

export const UpdateDailyRecordSchema = CreateDailyRecordSchema.partial();
export type UpdateDailyRecordInput = z.infer<typeof UpdateDailyRecordSchema>;

export const ImportCsvSchema = z.object({
  csvContent: z.string().min(1),
  conflictStrategy: z.enum(['ignore', 'overwrite']).default('ignore'),
});
export type ImportCsvInput = z.infer<typeof ImportCsvSchema>;
