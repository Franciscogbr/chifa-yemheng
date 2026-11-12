import { z } from 'zod';

const estadoSchema = z.enum(['P', 'C', 'A', 'X']);

export const reservaQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  fecha: z.string().optional(),
  mesaId: z.coerce.number().int().positive().optional(),
  estado: estadoSchema.optional(),
});

export const reservaCreateSchema = z.object({
  clienteId: z.number().int().positive(),
  mesaId: z.number().int().positive().optional(),
  origen: z.enum(['TELEFONO', 'PERSONAL']).default('PERSONAL'),
  fecha: z.string().min(1),
  hora: z.string().min(1),
  comensales: z.number().int().min(1).default(1),
  observacion: z.string().max(200).optional(),
  adelanto: z.number().min(0).default(0),
});

export const reservaConfirmarSchema = z.object({
  mesaId: z.number().int().positive(),
  adelanto: z.number().min(0).default(0),
  observacion: z.string().max(200).optional(),
});

export const reservaReprogramarSchema = z.object({
  fecha: z.string().min(1).optional(),
  hora: z.string().min(1).optional(),
  mesaId: z.number().int().positive().optional(),
  comensales: z.number().int().min(1).optional(),
  observacion: z.string().max(200).optional(),
});

export const reservaAtencionSchema = z.object({
  canal: z.enum(['QR', 'MOZO']),
});

export const disponibilidadQuerySchema = z.object({
  fecha: z.string().min(1),
  hora: z.string().min(1),
  mesaId: z.coerce.number().int().positive().optional(),
  comensales: z.coerce.number().int().min(1).default(1),
});

export type ReservaQuery = z.infer<typeof reservaQuerySchema>;
export type ReservaCreate = z.infer<typeof reservaCreateSchema>;
export type ReservaConfirmar = z.infer<typeof reservaConfirmarSchema>;
export type ReservaReprogramar = z.infer<typeof reservaReprogramarSchema>;
export type ReservaAtencion = z.infer<typeof reservaAtencionSchema>;
export type DisponibilidadQuery = z.infer<typeof disponibilidadQuerySchema>;