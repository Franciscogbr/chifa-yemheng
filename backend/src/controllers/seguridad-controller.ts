import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth-guard.js';
import {
  asignarPermisosSchema,
  rolCreateSchema,
  rolQuerySchema,
  rolUpdateSchema,
  usuarioCreateSchema,
  usuarioQuerySchema,
  usuarioUpdateSchema,
} from '../schemas/seguridad.js';
import {
  asignarPermisosService,
  guardarRolService,
  crearUsuarioService,
  listarPermisosService,
  listarRolesService,
  listarUsuariosService,
  actualizarUsuarioService,
  listarTiposUsuarioService,
  listarPermisosDeRolService,
} from '../services/seguridad-service.js';
import { getPc } from '../utils/auditoria.js';
import { SeguridadError, type SeguridadActor } from '../models/seguridad.js';

function sesion(req: Request): { actor: SeguridadActor; pc: string } {
  const user = (req as AuthenticatedRequest).user;
  return {
    actor: { id: user.sub, logeo: user.logeo, tipo: user.tipo, permisos: user.permisos },
    pc: getPc(req),
  };
}

function responderErrorSeguridad(res: Response, err: unknown): boolean {
  if (!(err instanceof SeguridadError)) return false;
  const status = {
    NOT_FOUND: 404,
    YA_EXISTE: 409,
    TIPO_INVALIDO: 422,
    ROL_TIPO_NO_ENCONTRADO: 422,
    ROL_TIPO_EN_USO: 409,
    VALIDATION_ERROR: 400,
    FORBIDDEN: 403,
    AUTO_MODIFICACION_PROHIBIDA: 403,
    EMPLEADO_INACTIVO: 422,
    ULTIMO_ADMINISTRADOR: 409,
    PERMISO_INVALIDO: 422,
    PRIVILEGE_ESCALATION: 403,
    MOTIVO_REQUERIDO: 400,
  }[err.code];
  res.status(status).json({ error: err.code });
  return true;
}

export async function getUsuarios(req: Request, res: Response): Promise<void> {
  const parsed = usuarioQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  res.json(await listarUsuariosService(parsed.data));
}
export async function getTiposUsuario(_req: Request, res: Response): Promise<void> {
  res.json(await listarTiposUsuarioService());
}
export async function postUsuario(req: Request, res: Response): Promise<void> {
  const parsed = usuarioCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  const { actor, pc } = sesion(req);
  try {
    res.status(201).json(await crearUsuarioService(parsed.data, actor, pc));
  } catch (err) {
    if (!responderErrorSeguridad(res, err)) throw err;
  }
}
export async function putUsuario(req: Request, res: Response): Promise<void> {
  const parsed = usuarioUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  const { actor, pc } = sesion(req);
  try {
    res.json(await actualizarUsuarioService(Number(req.params['id']), parsed.data, actor, pc));
  } catch (err) {
    if (!responderErrorSeguridad(res, err)) throw err;
  }
}
export async function getRoles(req: Request, res: Response): Promise<void> {
  const parsed = rolQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  res.json(await listarRolesService(parsed.data));
}
export async function postRol(req: Request, res: Response): Promise<void> {
  const parsed = rolCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  const { actor, pc } = sesion(req);
  try {
    res.status(201).json(await guardarRolService(null, parsed.data, actor, pc));
  } catch (err) {
    if (!responderErrorSeguridad(res, err)) throw err;
  }
}
export async function putRol(req: Request, res: Response): Promise<void> {
  const parsed = rolUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  const { actor, pc } = sesion(req);
  try {
    res.json(await guardarRolService(Number(req.params['id']), parsed.data, actor, pc));
  } catch (err) {
    if (!responderErrorSeguridad(res, err)) throw err;
  }
}
export async function getPermisos(_req: Request, res: Response): Promise<void> {
  res.json(await listarPermisosService());
}
export async function getPermisosDeRol(req: Request, res: Response): Promise<void> {
  res.json({ permisoIds: await listarPermisosDeRolService(Number(req.params['id'])) });
}
export async function putRolPermisos(req: Request, res: Response): Promise<void> {
  const parsed = asignarPermisosSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  const { actor, pc } = sesion(req);
  try {
    await asignarPermisosService(Number(req.params['id']), parsed.data, actor, pc);
    res.json({ ok: true });
  } catch (err) {
    if (!responderErrorSeguridad(res, err)) throw err;
  }
}
