import { z } from 'zod';

/** Apertura de turno de caja */
export const turnoCajaSchema = z.object({
  cajaId: z.number().int().positive(),
  montoInicial: z.number().min(0, 'MONTO_INVALIDO'),
  observacion: z.string().trim().max(200).optional().default(''),
});

const empresaSchema = z.object({
  razonSocial: z.string().min(1).max(140),
  direccion: z.string().min(1).max(200),
  ruc: z.string().regex(/^\d{11}$/, 'RUC de 11 dígitos'),
});

/** Cobro de pedido por caja (factura/boleta + pago + movimiento) */
export const cobroCajaSchema = z.object({
  pedidoId: z.number().int().positive(),
  cajaId: z.number().int().positive(),
  tipoDocumento: z.enum(['03', '01']).default('03'),
  clienteId: z.number().int().positive().nullable().default(null),
  empresa: empresaSchema.optional(),
  pagos: z.array(z.object({
    metodoPagoId: z.number().int().positive(),
    monto: z.number().positive(),
    montoRecibido: z.number().min(0).nullable().default(null),
    referencia: z.string().max(50).default(''),
    banco: z.string().max(60).default(''),
    clienteId: z.number().int().positive().nullable().default(null),
  })).min(1).max(20),
  aportes: z.array(z.object({
    clienteId: z.number().int().positive(),
    monto: z.number().positive(),
    referencia: z.string().max(50).default(''),
  })).min(1).max(50).optional(),
});

/** Cobro de la cuenta individual de un participante de mesa compartida (S3). */
export const cobroParticipanteSchema = z
  .object({
    pedidoId: z.number().int().positive(),
    clienteId: z.number().int().positive(),
    cajaId: z.number().int().positive(),
    tipoDocumento: z.enum(['03', '01']).default('03'),
    participanteDocumento: z.string().regex(/^[0-9]{8}$/).optional(),
    participanteNombre: z.string().max(120).optional(),
    empresa: z.object({
      id: z.number().int().positive(),
      ruc: z.string().regex(/^[0-9]{11}$/),
      razonSocial: z.string().min(3).max(150),
      direccionFiscal: z.string().min(5).max(200),
    }).optional(),
    pagos: z.array(z.object({
      metodoPagoId: z.number().int().positive(),
      monto: z.number().positive(),
      montoRecibido: z.number().min(0).nullable().default(null),
      referencia: z.string().max(50).default(''),
      banco: z.string().max(60).default(''),
    })).min(1).max(20),
  })
  .superRefine((data, ctx) => {
    if (data.tipoDocumento === '03' && !data.participanteDocumento) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['participanteDocumento'], message: 'DNI_REQUERIDO_BOLETA' });
    }
    if (data.tipoDocumento === '01' && !data.empresa) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['empresa'], message: 'EMPRESA_REQUERIDA_FACTURA' });
    }
  });

export type CobroParticipanteInput = z.infer<typeof cobroParticipanteSchema>;

export const movimientoCajaSchema = z.object({
  cajaId: z.number().int().positive(),
  conceptoId: z.number().int().positive(),
  metodoPagoId: z.number().int().positive(),
  monto: z.number().positive(),
  descripcion: z.string().trim().min(3).max(200),
  referencia: z.string().max(30).default(''),
  banco: z.string().max(60).default(''),
});

export const cierreCajaSchema = z.object({
  cajaId: z.number().int().positive(),
  montoDeclarado: z.number().min(0, 'MONTO_INVALIDO'),
  observacion: z.string().max(200).default(''),
});

export const confirmarCierreCajaSchema = z.object({
  aperturaId: z.number().int().positive(),
});

/** S5: arqueo por denominaciones + solicitud de cierre con niveles. */
export const arqueoCajaSchema = z.object({
  cajaId: z.number().int().positive(),
  denominaciones: z.array(z.object({
    valor: z.number().positive(),
    cantidad: z.number().int().min(0),
    tipo: z.enum(['BILLETE', 'MONEDA']),
  })).min(0),
  observacion: z.string().max(200).default(''),
});

export const resolverIncidenciaSchema = z.object({
  estado: z.enum(['EN_REVISION', 'JUSTIFICADA', 'CERRADA']),
  comentario: z.string().max(300).default(''),
});

export type TurnoCajaInput = z.infer<typeof turnoCajaSchema>;
export type CobroCajaInput = z.infer<typeof cobroCajaSchema>;
export type CierreCajaInput = z.infer<typeof cierreCajaSchema>;
