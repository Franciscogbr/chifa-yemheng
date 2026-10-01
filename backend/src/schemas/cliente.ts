import { z } from 'zod';

const estadoSchema = z.enum(['A', 'I']);
const emailSchema = z.string().email('Correo inválido').max(50);
const distritoSchema = z.number().int().positive('Distrito obligatorio');

export const clienteQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  buscar: z.string().max(50).optional(),
  tipo: z.enum(['N', 'J']).optional(),
  estado: estadoSchema.optional(),
  orden: z.enum(['puntos', 'alpha', 'recientes']).default('recientes'),
});

const generoSchema = z.enum(['M', 'F', 'O']); // espejo de CK_PERSONA_GEN

const baseContacto = {
  telefono: z.string().min(1).max(15),
  correo: emailSchema.optional(),
  distritoId: distritoSchema,
  direccion: z.string().max(100).optional().default(''),
  codigoCliente: z.string().max(15).optional(),
};

export const clienteCreateSchema = z.discriminatedUnion('tipo', [
  z.object({
    tipo: z.literal('N'),
    nombres: z.string().min(1).max(80),
    apPaterno: z.string().max(80).optional().default(''),
    apMaterno: z.string().max(80).optional().default(''),
    tipoDoc: z.enum(['DNI', 'CE', 'PASAPORTE']).default('DNI'),
    dni: z.string().min(1).max(15),
    fNacimiento: z.string().date().optional(),
    genero: generoSchema.optional(),
    ...baseContacto,
  }),
  z.object({
    tipo: z.literal('J'),
    razonSocial: z.string().min(1).max(140),
    nombreComercial: z.string().max(140).optional().default(''),
    ruc: z.string().regex(/^\d{11}$/, 'RUC de 11 dígitos'),
    ...baseContacto,
  }),
]);

export const clienteUpdateSchema = z.object({
  nombres: z.string().min(1).max(80).optional(),
  apPaterno: z.string().max(80).optional(),
  apMaterno: z.string().max(80).optional(),
  razonSocial: z.string().min(1).max(140).optional(),
  nombreComercial: z.string().max(140).optional(),
  telefono: z.string().min(1).max(15).optional(),
  correo: emailSchema.optional(),
  distritoId: distritoSchema.nullable().optional(),
  direccion: z.string().max(100).optional(),
  codigoCliente: z.string().max(15).nullable().optional(),
  fNacimiento: z.string().date().nullable().optional(),
  genero: generoSchema.nullable().optional(),
});

export const clienteEstadoSchema = z.object({
  estado: estadoSchema,
});

export type ClienteQuery = z.infer<typeof clienteQuerySchema>;
export type ClienteCreate = z.infer<typeof clienteCreateSchema>;
export type ClienteUpdate = z.infer<typeof clienteUpdateSchema>;
export type ClienteEstado = z.infer<typeof clienteEstadoSchema>;
