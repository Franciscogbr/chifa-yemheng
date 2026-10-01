import type { Request, Response } from 'express';
import { resumenDashboard } from '../repositories/dashboard-repository.js';

export async function getResumen(_req: Request, res: Response): Promise<void> {
  res.json(await resumenDashboard());
}
