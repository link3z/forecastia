import { z } from 'zod';

export const CreateBusinessSchema = z.object({
  name: z.string().trim().min(2).max(150),
  type: z.string().trim().min(2).max(50),
  location: z.string().trim().min(2).max(150),
  currency: z.string().trim().length(3).default('EUR'),
  startDate: z.coerce.date(),
  isSeasonal: z.boolean().default(false),
  seasonStart: z.coerce.date().nullish(),
  seasonEnd: z.coerce.date().nullish(),
  thresholds: z.array(z.number().positive()).min(1).default([100, 200, 300, 500, 1000]),
});
export type CreateBusinessInput = z.infer<typeof CreateBusinessSchema>;

export const UpdateBusinessSchema = CreateBusinessSchema.partial();
export type UpdateBusinessInput = z.infer<typeof UpdateBusinessSchema>;

export const UpdatePredictiveVariablesSchema = z.object({
  useWeather: z.boolean().optional(),
  useTemperature: z.boolean().optional(),
  useRain: z.boolean().optional(),
  useWind: z.boolean().optional(),
  useEvents: z.boolean().optional(),
  useCampaigns: z.boolean().optional(),
  useSocialFollowers: z.boolean().optional(),
  useObservations: z.boolean().optional(),
});
export type UpdatePredictiveVariablesInput = z.infer<typeof UpdatePredictiveVariablesSchema>;
