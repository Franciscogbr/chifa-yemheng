import type { NextFunction, Request, Response } from 'express';
import type { AuthenticatedRequest } from './auth-guard.js';

/** PermissionGuard: exige al menos uno de los permisos (claves) indicados. */
export function requirePermisos(...claves: string[]) {
  const wanted = claves.map((c) => c.toUpperCase());
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      res.status(401).json({ error: 'CREDENCIALES_INVALIDAS' });
      return;
    }
    const mine = user.permisos.map((p) => p.toUpperCase());
    if (!wanted.some((c) => mine.includes(c))) {
      res.status(403).json({ error: 'FORBIDDEN' });
      return;
    }
    next();
  };
}
