/** Etiquetas de equipo por punto físico (opcional, se guarda en pccre/pcmod). */
export const EQUIPOS = [
  'CAJA-01',
  'BARRA-01',
  'COCINA-01',
  'SALON-01',
  'DELIVERY-01',
  'OFICINA-01',
  'ALMACEN-01',
] as const;

export type Equipo = (typeof EQUIPOS)[number];

const CLAVE = 'equipo';

export function getEquipo(): string {
  try {
    return localStorage.getItem(CLAVE) ?? '';
  } catch {
    return '';
  }
}

export function setEquipo(valor: string): void {
  try {
    if (valor) {
      localStorage.setItem(CLAVE, valor);
    } else {
      localStorage.removeItem(CLAVE);
    }
  } catch {
    // sin almacenamiento, se usa IP como respaldo en el back
  }
}

/** Header X-PC para auditoría. Vacío = el back usa req.ip. */
export function headerEquipo(): Record<string, string> {
  const equipo = getEquipo().trim().toUpperCase().slice(0, 30);
  return equipo ? { 'X-PC': equipo } : {};
}
