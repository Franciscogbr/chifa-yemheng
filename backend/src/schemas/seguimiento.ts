import { z } from 'zod';

export const metodoPagoSchema = z.enum(['EFECTIVO', 'YAPE', 'PLIN', 'TARJETA', 'TRANSFERENCIA']);

export const registrarVentaDeliverySchema = z.object({
  monto: z.number().positive('El monto debe ser mayor a 0'),
  metodoPago: metodoPagoSchema,
  referencia: z.string().max(100).optional(),
}).superRefine((data, ctx) => {
  const metodosDigitales = ['YAPE', 'PLIN', 'TARJETA', 'TRANSFERENCIA'];
  if (metodosDigitales.includes(data.metodoPago) && (!data.referencia || data.referencia.trim() === '')) {
    ctx.addIssue({
      code: 'custom',
      message: 'La referencia es obligatoria para pagos digitales.',
      path: ['referencia'],
    });
  }
});

export type RegistrarVentaDeliveryInput = z.infer<typeof registrarVentaDeliverySchema>;
