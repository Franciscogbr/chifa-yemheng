import { z } from 'zod';

const estadoPreparacionSchema = z.enum(['P', 'L', 'A']);

export const pedidoQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  estado: z.string().max(20).optional(),
  mesa: z.coerce.number().int().positive().optional(),
  fecha: z.string().optional(),
});

export const pedidoAbrirSchema = z.object({
  tipo: z.number().int().positive(),
  mesa: z.number().int().positive().optional(),
  cliente: z.number().int().positive().optional(),
  empleado: z.number().int().positive().optional(),
  comensales: z.number().int().min(1).max(99).optional().default(1),
  obs: z.string().max(200).optional().default(''),
});

export const detalleAddSchema = z.object({
  producto: z.number().int().positive(),
  cantidad: z.number().positive(),
  nota: z.string().max(150).optional().default(''),
  descuento: z.number().min(0).optional().default(0),
});

export const pedidoAnularSchema = z.object({
  motivo: z.string().min(1).max(200),
});

export const preparacionUpdateSchema = z.object({
  estado: estadoPreparacionSchema,
});

export const comandaQuerySchema = z.object({
  mesaId: z.coerce.number().int().positive(),
});

export const cuentaSchema = z.object({
  mesaId: z.number().int().positive(),
});

export const detalleTandaSchema = z.object({
  producto: z.number().int().positive(),
  cantidad: z.number().positive(),
  nota: z.string().max(150).optional().default(''),
  descuento: z.number().min(0).optional().default(0),
});

export const tandaSchema = z.object({
  mesa: z.number().int().positive(),
  comensales: z.number().int().min(1).max(99).optional().default(1),
  obs: z.string().max(200).optional().default(''),
  detalles: z.array(detalleTandaSchema).min(1, 'Debe incluir al menos un plato'),
});

export const modoPagoMesaSchema = z.object({
  modo: z.enum(['CUENTA_UNICA', 'POR_CONSUMO']),
});

export const joinSettingSchema = z.object({
  aceptaParticipantes: z.boolean(),
});

export type PedidoQuery = z.infer<typeof pedidoQuerySchema>;
export type JoinSetting = z.infer<typeof joinSettingSchema>;
export type PedidoAbrir = z.infer<typeof pedidoAbrirSchema>;
export type DetalleAdd = z.infer<typeof detalleAddSchema>;
export type PedidoAnular = z.infer<typeof pedidoAnularSchema>;
export type PreparacionUpdate = z.infer<typeof preparacionUpdateSchema>;
export type ComandaQuery = z.infer<typeof comandaQuerySchema>;
export type Cuenta = z.infer<typeof cuentaSchema>;
export type ModoPagoMesaInput = z.infer<typeof modoPagoMesaSchema>;