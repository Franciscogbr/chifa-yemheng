import { z } from 'zod';

const estadoSchema = z.enum(['A', 'I']);
const emailSchema = z.string().email().max(50).optional().default('');

export const personalQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  buscar: z.string().max(50).optional(),
  cargo: z.coerce.number().int().optional(),
  turno: z.string().max(18).optional(),
  estado: estadoSchema.optional(),
});

const generoSchema = z.enum(['M', 'F', 'O']); // espejo de CK_PERSONA_GEN

export const personalCreateSchema = z.object({
  nombres: z.string().min(1).max(80),
  apPaterno: z.string().max(80).optional().default(''),
  apMaterno: z.string().max(80).optional().default(''),
  tipoDoc: z.enum(['DNI', 'CE', 'PASAPORTE']).default('DNI'),
  documento: z.string().min(1).max(15),
  telefono: z.string().regex(/^\d{9}$/, 'Celular de 9 dígitos'),
  correo: emailSchema,
  direccion: z.string().max(100).optional().default(''),
  distritoId: z.number().int().positive().optional(),
  fNacimiento: z.string().date().optional(),
  genero: generoSchema.optional(),
  cargoId: z.number().int().positive(),
  contratoId: z.number().int().positive(),
  turno: z.string().max(18).optional().default(''),
  fondoPension: z.string().max(3).optional().default(''),
  nHijos: z.number().int().min(0).max(9).optional(),
  essalud: z.string().max(6).optional().default(''),
  fIngreso: z.string().date().optional(),
  sueldo: z.number().min(0).default(0),
});

export const personalUpdateSchema = z.object({
  nombres: z.string().min(1).max(80).optional(),
  apPaterno: z.string().max(80).optional(),
  apMaterno: z.string().max(80).optional(),
  telefono: z.string().regex(/^\d{9}$/, 'Celular de 9 dígitos').optional(),
  correo: emailSchema.optional(),
  direccion: z.string().max(100).optional(),
  distritoId: z.number().int().positive().nullable().optional(),
  fNacimiento: z.string().date().nullable().optional(),
  genero: generoSchema.nullable().optional(),
  cargoId: z.number().int().positive().optional(),
  contratoId: z.number().int().positive().optional(),
  turno: z.string().max(18).optional(),
  fondoPension: z.string().max(3).nullable().optional(),
  nHijos: z.number().int().min(0).max(9).nullable().optional(),
  essalud: z.string().max(6).nullable().optional(),
  fIngreso: z.string().date().optional(),
  fCese: z.string().date().nullable().optional(),
  sueldo: z.number().min(0).optional(),
});

export const personalEstadoSchema = z.object({
  estado: estadoSchema,
});

export type PersonalQuery = z.infer<typeof personalQuerySchema>;
export type PersonalCreate = z.infer<typeof personalCreateSchema>;
export type PersonalUpdate = z.infer<typeof personalUpdateSchema>;
export type PersonalEstado = z.infer<typeof personalEstadoSchema>;
