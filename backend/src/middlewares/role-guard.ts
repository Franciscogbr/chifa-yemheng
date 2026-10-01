import type { NextFunction, Request, Response } from 'express';
import type { AuthenticatedRequest } from './auth-guard.js';

/** RoleGuard: exige al menos uno de los roles (tipos) indicados. */
export function requireRoles(...roles: string[]) {
  const wanted = roles.map((r) => r.toUpperCase());
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      res.status(401).json({ error: 'CREDENCIALES_INVALIDAS' });
      return;
    }
    const mine = [...user.roles, user.tipo].map((r) => r.toUpperCase());
    if (!wanted.some((r) => mine.includes(r))) {
      res.status(403).json({ error: 'FORBIDDEN' });
      return;
    }
    next();
  };
}
