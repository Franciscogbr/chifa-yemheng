import { z } from 'zod';

export const loginSchema = z.object({
  logeo: z.string().min(3).max(30),
  clave: z.string().min(1).max(100),
});

export const claveSchema = z.object({
  actual: z.string().min(1).max(100),
  nueva: z.string().min(4).max(100),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ClaveInput = z.infer<typeof claveSchema>;
