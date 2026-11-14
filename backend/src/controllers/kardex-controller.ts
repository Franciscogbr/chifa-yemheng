import type { Request, Response } from 'express';
import { kardexQuerySchema } from '../schemas/kardex.schema.js';
import { listarKardexService } from '../services/kardex-service.js';

export async function getKardex(req: Request, res: Response): Promise<void> {
  const parsed = kardexQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    return;
  }
  try {
    const result = await listarKardexService(parsed.data);
    res.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'INTERNAL_ERROR', detalle: msg });
  }
}
