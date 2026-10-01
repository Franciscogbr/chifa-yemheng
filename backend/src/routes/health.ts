import { Router, type Request, type Response } from 'express';
import { supabase } from '../config/supabase.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req: Request, res: Response) => {
  let db = false;
  try {
    const { error } = await supabase.from('modulo').select('id_modulo').limit(1);
    db = !error;
  } catch {
    db = false;
  }
  res.json({ ok: true, db });
});
