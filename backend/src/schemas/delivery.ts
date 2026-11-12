import { z } from 'zod';

const estadoSchema = z.enum(['P', 'R', 'E', 'C']);

export const deliveryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  estado: estadoSchema.optional(),
  repartidorId: z.coerce.number().int().positive().optional(),
});

export const deliveryCreateSchema = z.object({
  clienteId: z.number().int().positive(),
  items: z.array(z.object({
    productoId: z.number().int().positive(),
    cantidad: z.number().int().positive(),
    nota: z.string().max(150).optional(),
  }).strict()).min(1),
  distritoId: z.number().int().positive(),
  direccion: z.string().trim().min(1).max(150),
  referencia: z.string().max(150).optional(),
  telefono: z.string().trim().regex(/^\d{9}$/),
  costoEnvio: z.number().finite().min(0).default(0),
  latCliente: z.number().min(-90).max(90).optional(),
  lngCliente: z.number().min(-180).max(180).optional(),
}).superRefine((data, ctx) => {
  if ((data.latCliente === undefined) !== (data.lngCliente === undefined)) {
    ctx.addIssue({
      code: 'custom',
      message: 'La ubicación debe incluir latitud y longitud.',
      path: ['latCliente'],
    });
  }
});

export const deliveryAsignarSchema = z.object({
  repartidorId: z.number().int().positive(),
  costoEnvio: z.number().finite().min(0).optional(),
});

export const sugerirCostoQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  distrito: z.coerce.number().int().positive(),
});

export const sugerirCostoResponseSchema = z.object({
  distanciaKm: z.number().nullable(),
  fueraRadio: z.boolean(),
  dentroCobertura: z.boolean(),
  costoSugerido: z.number(),
});

export const parametrosNegocioUpdateSchema = z.object({
  latLocal: z.number().min(-90).max(90).nullable().optional(),
  lngLocal: z.number().min(-180).max(180).nullable().optional(),
  direccionLocal: z.string().max(200).nullable().optional(),
  radioCoberturaKm: z.number().min(0).nullable().optional(),
});

export const tarifaUpsertSchema = z.object({
  costoBase: z.number().min(0),
  radioKm: z.number().positive(),
  recargoKm: z.number().min(0),
});

export type ParametrosNegocioUpdate = z.infer<typeof parametrosNegocioUpdateSchema>;
export type TarifaUpsert = z.infer<typeof tarifaUpsertSchema>;

export type DeliveryQuery = z.infer<typeof deliveryQuerySchema>;
export type DeliveryCreate = z.infer<typeof deliveryCreateSchema>;
export type DeliveryAsignar = z.infer<typeof deliveryAsignarSchema>;
export type SugerirCostoQuery = z.infer<typeof sugerirCostoQuerySchema>;
export type SugerirCostoResponse = z.infer<typeof sugerirCostoResponseSchema>;
