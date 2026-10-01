import { z } from 'zod';

const tipoSchema = z.enum(['P', 'B', 'I']);
const estadoSchema = z.enum(['A', 'I']);

export const productoQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  nombre: z.string().max(50).optional(),
  categoria: z.coerce.number().int().optional(),
  estado: estadoSchema.optional(),
  disponible: z.enum(['S', 'N']).optional(),
});

export const productoCreateSchema = z.object({
  nombre: z.string().min(1).max(50),
  categoriaId: z.number().int().positive(),
  unidadId: z.number().int().positive(),
  tipo: tipoSchema.default('P'),
  precio: z.number().min(0),
  costo: z.number().min(0).default(0),
  stock: z.number().min(0).default(0),
  stockMin: z.number().min(0).default(0),
  controlaStock: z.boolean().default(false),
  tiempo: z.number().int().min(0).optional(),
  disponible: z.boolean().default(true),
  imagen: z.string().max(200).optional().default(''),
  detalle: z.string().max(150).optional().default(''),
  afectoIgv: z.boolean().default(true),
  codigo: z.string().max(20).optional(),
  estado: estadoSchema.default('A'),
});

export const productoUpdateSchema = productoCreateSchema.partial().omit({
  categoriaId: true,
  unidadId: true,
}).extend({
  categoriaId: z.number().int().positive().optional(),
  unidadId: z.number().int().positive().optional(),
});

export const productoEstadoSchema = z.object({
  estado: estadoSchema,
});

export type ProductoQuery = z.infer<typeof productoQuerySchema>;
export type ProductoCreate = z.infer<typeof productoCreateSchema>;
export type ProductoUpdate = z.infer<typeof productoUpdateSchema>;
export type ProductoEstado = z.infer<typeof productoEstadoSchema>;
