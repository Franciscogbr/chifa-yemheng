import type { Request, Response } from 'express';
import {
  cargosService,
  contratosService,
  distritosService,
  tiposIdentidadService,
} from '../services/maestros-service.js';

export async function getDistritos(_req: Request, res: Response): Promise<void> {
  res.json(await distritosService());
}

export async function getCargos(_req: Request, res: Response): Promise<void> {
  res.json(await cargosService());
}

export async function getContratos(_req: Request, res: Response): Promise<void> {
  res.json(await contratosService());
}

export async function getTiposIdentidad(_req: Request, res: Response): Promise<void> {
  res.json(await tiposIdentidadService());
}
