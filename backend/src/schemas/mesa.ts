import { z } from 'zod';

const estadoSchema = z.enum(['A', 'I']);

export const mesaQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  ambiente: z.coerce.number().int().optional(),
  estado: estadoSchema.optional(),
  buscar: z.string().max(30).optional(),
});

export const mesaCreateSchema = z.object({
  ambienteId: z.number().int().positive(),
  numero: z.string().min(1).max(5),
  capacidad: z.number().int().min(1).max(99),
  tipoId: z.number().int().positive(),
  detalle: z.string().max(100).optional().default(''),
  estado: estadoSchema.default('A'),
});

export const mesaUpdateSchema = z.object({
  ambienteId: z.number().int().positive().optional(),
  numero: z.string().min(1).max(5).optional(),
  capacidad: z.number().int().min(1).max(99).optional(),
  tipoId: z.number().int().positive().optional(),
  detalle: z.string().max(100).optional(),
  regenerarQr: z.boolean().optional().default(false),
});

export const mesaEstadoSchema = z.object({
  estado: estadoSchema,
});

export const mesaQrQuerySchema = z.object({
  codigo: z.string().trim().min(1).max(60),
});

export type MesaQrQuery = z.infer<typeof mesaQrQuerySchema>;

export const ambienteCreateSchema = z.object({
  nombre: z.string().min(1).max(50),
  descripcion: z.string().max(100).optional().default(''),
  piso: z.number().int().optional(),
});

export const ambienteUpdateSchema = ambienteCreateSchema.partial();

export type MesaQuery = z.infer<typeof mesaQuerySchema>;
export type MesaCreate = z.infer<typeof mesaCreateSchema>;
export type MesaUpdate = z.infer<typeof mesaUpdateSchema>;
export type MesaEstado = z.infer<typeof mesaEstadoSchema>;
export type AmbienteCreate = z.infer<typeof ambienteCreateSchema>;
export type AmbienteUpdate = z.infer<typeof ambienteUpdateSchema>;
