/** Icono de mesa para el Mapa: tablero madera + sillas del color del estado. */
export function esRedonda(tipo: string): boolean {
  const t = (tipo ?? '').toUpperCase();
  return t.includes('REDONDA') || t === 'MESA VIP';
}

/** Glifo sobre el tablero según estado operativo. null = sin glifo (libre). */
export function glifoPorEstado(estado: string): string | null {
  const e = (estado ?? '').toUpperCase();
  if (e === 'OCUPADA') {
    return 'groups';
  }
  if (e === 'RESERVADA') {
    return 'calendar_month';
  }
  if (e === 'POR COBRAR') {
    return 'payments';
  }
  if (e === 'FUERA DE SERVICIO') {
    return 'block';
  }
  return null;
}

function repartirSillas(n: number): { top: number; bottom: number; left: number; right: number } {
  const total = Math.max(2, Math.min(n || 4, 8));
  const top = Math.min(3, Math.ceil(total / 2));
  const bottom = Math.min(3, total - top);
  const resto = total - top - bottom;
  const left = resto >= 1 ? 1 : 0;
  const right = resto - left;
  return { top, bottom, left, right };
}

interface MesaIconProps {
  numero: string;
  estado: string;
  color: string;
  tipo: string;
  capacidad: number;
  atenuado?: boolean;
  mini?: boolean;
}

export function MesaIcon({ numero, estado, color, tipo, capacidad, atenuado, mini }: MesaIconProps) {
  const redonda = esRedonda(tipo);
  const glifo = glifoPorEstado(estado);
  const rep = repartirSillas(capacidad);
  const tablero = mini ? 38 : 92;
  const sillaW = mini ? 9 : 20;
  const sillaH = mini ? 12 : 28;

  const silla = (key: string, vertical: boolean) => (
    <span
      key={key}
      style={{
        width: vertical ? sillaH : sillaW,
        height: vertical ? sillaW : sillaH,
        backgroundColor: color,
        borderRadius: 4,
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        opacity: atenuado ? 0.35 : 1,
      }}
    />
  );

  const fila = (n: number, prefijo: string) => (
    <span className="flex gap-1">
      {Array.from({ length: n }, (_, i) => silla(`${prefijo}-${i}`, false))}
    </span>
  );

  return (
    <span
      className="inline-flex flex-col items-center gap-[3px]"
      style={atenuado ? { filter: 'grayscale(0.7)', opacity: 0.75 } : undefined}
      role="img"
      aria-label={`Mesa ${numero} ${estado}`}
    >
      {fila(rep.top, 't')}
      <span className="flex items-center gap-[3px]">
        <span className="flex flex-col gap-1">
          {Array.from({ length: rep.left }, (_, i) => silla(`l-${i}`, true))}
        </span>
        <span
          className="flex flex-col items-center justify-center"
          style={{
            width: tablero,
            height: tablero,
            borderRadius: redonda ? '50%' : 12,
            background: 'radial-gradient(circle at 35% 30%, #A9713B, #7A4E1F 72%)',
            border: '3px solid rgba(0,0,0,0.18)',
            boxShadow: '0 3px 8px rgba(0,0,0,0.35)',
            opacity: atenuado ? 0.6 : 1,
          }}
        >
          {!mini && (
            <span
              className="leading-none font-bold text-white"
              style={{ fontSize: 17, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
            >
              {numero}
            </span>
          )}
          {glifo && (
            <span
              className="material-symbols-outlined text-white"
              style={{ fontSize: mini ? 16 : 22, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
            >
              {glifo}
            </span>
          )}
        </span>
        <span className="flex flex-col gap-1">
          {Array.from({ length: rep.right }, (_, i) => silla(`r-${i}`, true))}
        </span>
      </span>
      {fila(rep.bottom, 'b')}
    </span>
  );
}
