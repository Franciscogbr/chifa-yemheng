import { z } from 'zod';

const estadosDelivery = z.preprocess(
  (value) => typeof value === 'string' ? value.split(',') : value,
  z.array(z.enum(['P', 'R', 'E', 'C'])).min(1).optional(),
);

export const repartidorEntregasQuerySchema = z.object({
  estado: estadosDelivery,
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type RepartidorEntregasQuery = z.infer<typeof repartidorEntregasQuerySchema>;
