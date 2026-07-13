import { z } from 'zod';

export const GenerateForecastSchema = z.object({
  targetDate: z.coerce.date(),
  weather: z.string().trim().optional().nullable(),
  tempMax: z.coerce.number().optional().nullable(),
  tempMin: z.coerce.number().optional().nullable(),
  rain: z.string().trim().optional().nullable(),
  wind: z.string().trim().optional().nullable(),
  event: z.string().trim().optional().nullable(),
  campaign: z.string().trim().optional().nullable(),
  observations: z.string().trim().optional().nullable(),
});

export type GenerateForecastInput = z.infer<typeof GenerateForecastSchema>;
