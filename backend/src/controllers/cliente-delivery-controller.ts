import type { Request, Response } from 'express';
import type { ClienteAuthenticatedRequest } from '../middlewares/cliente-auth-guard.js';
import { z } from 'zod';
import { crearDeliveryClienteService, sugerirCostoClienteService, getDeliveryDetalleClienteService, getDeliveryUbicacionClienteService, getDeliveryComprobanteClienteService, getCoberturaDeliveryClienteService, getDeliveryActivoClienteService } from '../services/cliente-delivery-service.js';
import { DeliveryError } from '../models/delivery.js';
import { getPc } from '../utils/auditoria.js';

const clienteDeliveryCreateSchema = z.object({
  items: z.array(z.object({
    productoId: z.number().int().positive(),
    cantidad: z.number().int().positive(),
    nota: z.string().max(150).optional(),
  }).strict()).min(1),
  direccion: z.string().trim().min(1).max(150),
  distritoId: z.number().int().positive(),
  referencia: z.string().max(150).optional(),
  telefono: z.string().regex(/^\d{9}$/, 'El teléfono debe tener 9 dígitos.'),
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

const sugerirCostoQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  distrito: z.coerce.number().int().positive(),
});

function sesion(req: Request): { id: number; logeo: string; pc: string } {
  const user = (req as ClienteAuthenticatedRequest).user;
  return { id: user.sub, logeo: user.email, pc: getPc(req) };
}

export async function postClienteDelivery(req: Request, res: Response): Promise<void> {
  const parsed = clienteDeliveryCreateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }); return; }
  const s = sesion(req);
  try {
    const delivery = await crearDeliveryClienteService({ ...parsed.data, clienteId: s.id }, s.pc);
    res.status(201).json({
      idPedidoDelivery: delivery.id,
      situacion: delivery.estado,
      costoEnvio: delivery.costo,
      costoConfirmado: delivery.costoConfirmado,
    });
  } catch (e) {
    if (e instanceof DeliveryError) {
      if (e.code === 'AUTOSERVICIO_USER_NOT_READY') {
        console.error('[CLIENTE_DELIVERY_AUTOSERVICIO_NOT_READY]', { clienteId: s.id });
        res.status(503).json({ error: 'DELIVERY_TEMPORARILY_UNAVAILABLE' });
        return;
      }
      if (e.code === 'FUERA_DE_COBERTURA' || e.code === 'PRODUCTO_NO_DISPONIBLE') {
        res.status(409).json({ error: e.code });
        return;
      }
      if (e.code === 'DISTRITO_NOT_FOUND') {
        res.status(400).json({ error: 'DISTRITO_NOT_FOUND' });
        return;
      }
      if (e.code === 'CLIENTE_NOT_FOUND') {
        res.status(401).json({ error: 'CLIENTE_NOT_FOUND' });
        return;
      }
      if (e.code === 'VALIDATION_ERROR') {
        res.status(400).json({ error: 'VALIDATION_ERROR' });
        return;
      }
    }

    console.error('[CLIENTE_DELIVERY_CREATE_FAIL]', { clienteId: s.id, error: e });
    res.status(500).json({ error: 'DELIVERY_CREATE_FAIL' });
  }
}

export async function getSugerirCostoCliente(req: Request, res: Response): Promise<void> {
  const parsed = sugerirCostoQuerySchema.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }); return; }
  try {
    res.json(await sugerirCostoClienteService(parsed.data.lat ?? null, parsed.data.lng ?? null, parsed.data.distrito));
  } catch (e) {
    if (e instanceof DeliveryError && e.code === 'DISTRITO_NOT_FOUND') {
      res.status(404).json({ error: 'DISTRITO_NOT_FOUND' });
      return;
    }
    throw e;
  }
}

export async function getCoberturaDeliveryCliente(_req: Request, res: Response): Promise<void> {
  res.json(await getCoberturaDeliveryClienteService());
}

export async function getClienteDeliveryActivo(req: Request, res: Response): Promise<void> {
  const s = sesion(req);
  res.json({ idPedidoDelivery: await getDeliveryActivoClienteService(s.id) });
}

export async function getClienteDeliveryDetalle(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    res.status(400).json({ error: 'VALIDATION_ERROR' });
    return;
  }
  const s = sesion(req);
  try {
    res.json(await getDeliveryDetalleClienteService(id, s.id));
  } catch (e) {
    if (e instanceof DeliveryError && e.code === 'NOT_FOUND') {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }
    throw e;
  }
}

export async function getClienteDeliveryUbicacion(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    res.status(400).json({ error: 'VALIDATION_ERROR' });
    return;
  }
  const s = sesion(req);
  try {
    res.json(await getDeliveryUbicacionClienteService(id, s.id));
  } catch (e) {
    if (e instanceof DeliveryError && e.code === 'NOT_FOUND') {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }
    throw e;
  }
}

export async function getClienteDeliveryComprobante(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    res.status(400).json({ error: 'VALIDATION_ERROR' });
    return;
  }
  const s = sesion(req);
  try {
    res.json(await getDeliveryComprobanteClienteService(id, s.id));
  } catch (e) {
    if (e instanceof DeliveryError && e.code === 'NOT_FOUND') {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }
    throw e;
  }
}