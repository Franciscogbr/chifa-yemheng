import type { Request } from 'express';

/** Etiquetas de equipo permitidas (pccre/pcmod, varchar 30). QR-cliente no manda X-PC. */
export const EQUIPOS = [
  'CAJA-01',
  'BARRA-01',
  'COCINA-01',
  'SALON-01',
  'DELIVERY-01',
  'OFICINA-01',
  'ALMACEN-01',
] as const;

/** Lee X-PC validado o cae a IP. Nunca lanza. */
export function getPc(req: Request): string {
  const h = String(req.header('X-PC') ?? '').trim().toUpperCase().slice(0, 30);
  if ((EQUIPOS as readonly string[]).includes(h)) {
    return h;
  }
  const ip = String((req as Request & { ip?: string }).ip ?? req.socket?.remoteAddress ?? '').slice(0, 30);
  return ip;
}

export function createAudit(logeo: string, pc: string): { usucre: string; pccre: string | null; feccre: string } {
  return { usucre: logeo, pccre: pc || null, feccre: new Date().toISOString() };
}

export function updateAudit(logeo: string, pc: string): { usumod: string; pcmod: string | null; fecmod: string } {
  return { usumod: logeo, pcmod: pc || null, fecmod: new Date().toISOString() };
}
