import { z } from 'zod';

export const kardexQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  productoId: z.coerce.number().int().positive().optional(),
  nombre: z.string().max(100).optional(),
  categoriaId: z.coerce.number().int().positive().optional(),
  clasificacion: z.string().max(30).optional(),
  tipo: z.enum(['E', 'S', 'A', 'M']).optional(),
  desde: z.iso.date().optional(),
  hasta: z.iso.date().optional(),
}).refine((value) => !value.desde || !value.hasta || value.desde <= value.hasta, {
  path: ['hasta'],
  message: 'La fecha hasta debe ser igual o posterior a la fecha desde.',
});

export type KardexQuery = z.infer<typeof kardexQuerySchema>;
