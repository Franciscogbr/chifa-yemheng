import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { JwtPayload } from '../models/auth.js';

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

/** AuthGuard: exige JWT válido en Authorization: Bearer. */
export function authGuard(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    res.status(401).json({ error: 'CREDENCIALES_INVALIDAS' });
    return;
  }
  try {
    const decoded: unknown = jwt.verify(token, env.JWT_SECRET);
    if (!isJwtPayload(decoded)) {
      res.status(401).json({ error: 'CREDENCIALES_INVALIDAS' });
      return;
    }
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'CREDENCIALES_INVALIDAS' });
  }
}

function isJwtPayload(value: unknown): value is JwtPayload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const v = value as Record<string, unknown>;
  return (
    typeof v['sub'] === 'number' &&
    typeof v['logeo'] === 'string' &&
    typeof v['tipo'] === 'string' &&
    Array.isArray(v['roles']) &&
    Array.isArray(v['permisos'])
  );
}
