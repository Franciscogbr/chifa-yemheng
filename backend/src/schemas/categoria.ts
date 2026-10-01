import { z } from 'zod';

const areaSchema = z.enum(['COCINA', 'BARRA']);
const estadoSchema = z.enum(['A', 'I']);

export const categoriaQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  nombre: z.string().max(50).optional(),
  estado: estadoSchema.optional(),
});

export const categoriaCreateSchema = z.object({
  nombre: z.string().min(1).max(50),
  descripcion: z.string().max(100).optional().default(''),
  area: areaSchema.default('COCINA'),
  orden: z.number().int().min(0).optional(),
  estado: estadoSchema.default('A'),
});

export const categoriaUpdateSchema = categoriaCreateSchema.partial();

export const categoriaEstadoSchema = z.object({
  estado: estadoSchema,
  confirmar: z.boolean().optional().default(false),
});

export type CategoriaQuery = z.infer<typeof categoriaQuerySchema>;
export type CategoriaCreate = z.infer<typeof categoriaCreateSchema>;
export type CategoriaUpdate = z.infer<typeof categoriaUpdateSchema>;
export type CategoriaEstado = z.infer<typeof categoriaEstadoSchema>;
