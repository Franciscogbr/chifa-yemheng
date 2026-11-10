import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  JWT_SECRET: z.string().min(16),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).default(0),
  GOOGLE_CLIENT_ID: z.string().min(10).optional(),
  DATABASE_URL: z.string().min(1).optional(),
  FACTILIZA_TOKEN: z.string().min(10).optional(),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
