import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  JWT_SECRET: z.string().min(16),
  DATABASE_URL: z.string().min(1).optional(),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
