import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8).max(72),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginSchema>;
