import { z } from 'zod';

const tipoMovimientoSchema = z.enum(['E', 'S', 'A', 'M']);

export const movimientoQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  productoId: z.coerce.number().int().positive().optional(),
  tipo: tipoMovimientoSchema.optional(),
});

export const movimientoCreateSchema = z.object({
  productoId: z.number().int().positive(),
  tipo: tipoMovimientoSchema,
  cantidad: z.number().positive(),
  costo: z.number().min(0).default(0),
  motivo: z.string().max(200).optional(),
  documento: z.string().max(50).optional(),
  idPedido: z.number().int().positive().optional(),
});

export const recetaQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  productoId: z.coerce.number().int().positive().optional(),
});

export const recetaCreateSchema = z.object({
  productoId: z.number().int().positive(),
  insumoId: z.number().int().positive(),
  cantidad: z.number().positive(),
});

export const recetaUpdateSchema = z.object({
  cantidad: z.number().positive().optional(),
  estado: z.enum(['A', 'I']).optional(),
}).refine((value) => value.cantidad !== undefined || value.estado !== undefined);

export const stockQuerySchema = z.object({
  productoId: z.coerce.number().int().positive().optional(),
  soloBajoStock: z.coerce.boolean().optional(),
  nombre: z.string().max(100).optional(),
  categoriaId: z.coerce.number().int().positive().optional(),
  unidadId: z.coerce.number().int().positive().optional(),
  stockMinimoDesde: z.coerce.number().min(0).optional(),
  stockMinimoHasta: z.coerce.number().min(0).optional(),
  stockActualDesde: z.coerce.number().min(0).optional(),
  stockActualHasta: z.coerce.number().min(0).optional(),
  ordenarPor: z.enum(['nombre', 'stock_actual', 'stock_minimo']).optional().default('nombre'),
  ordenDireccion: z.enum(['asc', 'desc']).optional().default('asc'),
});

export const recetaCostoQuerySchema = z.object({
  productoId: z.coerce.number().int().positive(),
});

export type MovimientoQuery = z.infer<typeof movimientoQuerySchema>;
export type MovimientoCreate = z.infer<typeof movimientoCreateSchema>;
export type RecetaQuery = z.infer<typeof recetaQuerySchema>;
export type RecetaCreate = z.infer<typeof recetaCreateSchema>;
export type RecetaUpdate = z.infer<typeof recetaUpdateSchema>;
export type StockQuery = z.infer<typeof stockQuerySchema>;
export type RecetaCostoQuery = z.infer<typeof recetaCostoQuerySchema>;
