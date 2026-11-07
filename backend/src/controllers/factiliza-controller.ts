import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { FactilizaError, consultarDni, consultarRuc } from '../services/factiliza-service.js';

function responderError(res: Response, error: unknown, next: NextFunction): void {
  if (error instanceof FactilizaError) {
    res.status(error.status).json({ error: error.code });
    return;
  }
  next(error);
}

export async function postDatosDni(req: Request, res: Response, next: NextFunction): Promise<void> {
  const parsed = z.object({ dni: z.string().regex(/^\d{8}$/) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'DNI_INVALIDO' });
    return;
  }
  try {
    res.json(await consultarDni(parsed.data.dni));
  } catch (error) {
    responderError(res, error, next);
  }
}

export async function postDatosRuc(req: Request, res: Response, next: NextFunction): Promise<void> {
  const parsed = z.object({ ruc: z.string().regex(/^\d{11}$/) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'RUC_INVALIDO' });
    return;
  }
  try {
    res.json(await consultarRuc(parsed.data.ruc));
  } catch (error) {
    responderError(res, error, next);
  }
}
