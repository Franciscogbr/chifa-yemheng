import { useMemo, useState } from 'react';
import { registrarArqueo, type ArqueoResultado } from '../staff-service';

const DENOMINACIONES: { valor: number; tipo: 'BILLETE' | 'MONEDA' }[] = [
  { valor: 200, tipo: 'BILLETE' },
  { valor: 100, tipo: 'BILLETE' },
  { valor: 50, tipo: 'BILLETE' },
  { valor: 20, tipo: 'BILLETE' },
  { valor: 10, tipo: 'BILLETE' },
  { valor: 5, tipo: 'MONEDA' },
  { valor: 2, tipo: 'MONEDA' },
  { valor: 1, tipo: 'MONEDA' },
  { valor: 0.5, tipo: 'MONEDA' },
  { valor: 0.2, tipo: 'MONEDA' },
  { valor: 0.1, tipo: 'MONEDA' },
];

const fmt = (n: number) => `S/ ${n.toFixed(2)}`;

interface Props {
  cajaId: number;
  cajaNombre: string;
  saldoTeorico: number;
  onHecho: (msg: string) => void;
}

type Nivel = 'CUADRADA' | 'MENOR' | 'MEDIA' | 'CRITICA';

export function CajaArqueo({ cajaId, cajaNombre, saldoTeorico, onHecho }: Props) {
  const [cantidades, setCantidades] = useState<Record<number, number>>({});
  const [observacion, setObservacion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ArqueoResultado | null>(null);

  const contado = useMemo(
    () => DENOMINACIONES.reduce((sum, d) => sum + d.valor * (cantidades[d.valor] ?? 0), 0),
    [cantidades],
  );
  const dif = Math.round((contado - saldoTeorico) * 100) / 100;
  const absDif = Math.abs(dif);
  const nivel: Nivel = absDif === 0 ? 'CUADRADA' : absDif <= 10 ? 'MENOR' : absDif <= 50 ? 'MEDIA' : 'CRITICA';
  const obsRequerida = nivel !== 'CUADRADA';
  const observacionValida = !obsRequerida || observacion.trim().length >= 4;

  const ESTILO_NIVEL: Record<Nivel, { chip: string; texto: string }> = {
    CUADRADA: { chip: 'chip ok', texto: 'Cuadrada' },
    MENOR: { chip: 'chip warn', texto: 'Diferencia menor (≤ S/ 10)' },
    MEDIA: { chip: 'chip warn', texto: 'Incidencia MEDIA — supervisor será informado' },
    CRITICA: { chip: 'chip bad', texto: 'CRÍTICA — requerirá confirmación de otro autorizado' },
  };

  async function enviar() {
    setError(null);
    setEnviando(true);
    try {
      const r = await registrarArqueo({
        cajaId,
        denominaciones: DENOMINACIONES.map((d) => ({
          valor: d.valor,
          cantidad: cantidades[d.valor] ?? 0,
          tipo: d.tipo,
        })),
        observacion,
      });
      setResultado(r);
      onHecho(
        r.resultado === 'CUADRADA'
          ? `Arqueo cuadrado. Solicitud de cierre registrada en ${cajaNombre}.`
          : `Arqueo ${r.resultado.toLowerCase()} (${fmt(r.diferencia)})${r.idIncidencia ? ` — incidencia #${r.idIncidencia}` : ''}${r.requiereSupervisor ? ' — requiere validación de supervisor' : ''}.`,
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  if (resultado) {
    return (
      <div className="caja-validaciones y-panel y-panel-card" aria-label="Arqueo registrado">
        <h2 style={{ margin: 0, fontFamily: 'var(--font-d)', fontSize: 22 }}>Arqueo registrado</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>
          Sistema {fmt(resultado.sistema)} · Contado {fmt(resultado.declarado)} ·{' '}
          <b style={{ color: resultado.diferencia === 0 ? 'var(--color-success)' : 'var(--text)' }}>
            {resultado.resultado} {fmt(resultado.diferencia)}
          </b>
        </p>
        <ul style={{ color: 'var(--text-muted)', fontSize: 13, margin: '8px 0 0', paddingLeft: 18 }}>
          <li>El turno queda pendiente de validación por otro usuario autorizado.</li>
          {resultado.idIncidencia != null && <li>Incidencia #{resultado.idIncidencia} creada y visible en la bandeja.</li>}
        </ul>
      </div>
    );
  }

  return (
    <div className="caja-validaciones y-panel y-panel-card" aria-label="Arqueo del turno">
      <div className="caja-section-heading">
        <h2>Arqueo del turno · {cajaNombre}</h2>
        <span className="caja-count">🧮</span>
      </div>

      <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
        {DENOMINACIONES.map((d) => (
          <label key={d.valor} style={{ display: 'grid', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
            <span>
              {d.tipo === 'BILLETE' ? '💵' : '🪙'} {fmt(d.valor)}
            </span>
            <input
              type="number"
              min={0}
              step={1}
              value={cantidades[d.valor] ?? ''}
              onChange={(e) =>
                setCantidades((prev) => ({ ...prev, [d.valor]: Math.max(0, Math.floor(Number(e.target.value || 0))) }))
              }
              className="input"
              autoComplete="off"
            />
          </label>
        ))}
      </div>

      <div className="caja-arqueo-cifras" style={{ marginTop: 14 }}>
        <span>
          Contado <b style={{ fontSize: 18 }}>{fmt(contado)}</b>
        </span>
        <span>
          Teórico <b style={{ fontSize: 18 }}>{fmt(saldoTeorico)}</b>
        </span>
        <span>
          Diferencia{' '}
          <b style={{ fontSize: 18, color: dif === 0 ? 'var(--color-success)' : 'var(--text)' }}>{fmt(dif)}</b>
        </span>
      </div>

      <div className="y-banner" style={{ marginTop: 10 }}>
        {ESTILO_NIVEL[nivel].texto}
      </div>

      {obsRequerida && (
        <label style={{ display: 'grid', gap: 5, marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
          Observación del arqueo (obligatoria con diferencia)
          <textarea
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            rows={2}
            maxLength={200}
            className="input"
            placeholder="Ej: falta 1 billete de 50; revisar fondo de caja"
          />
        </label>
      )}

      {error && (
        <div className="y-chip bad" style={{ display: 'inline-flex', marginTop: 10 }}>
          {error === 'OBSERVACION_REQUERIDA'
            ? 'La observación es obligatoria cuando hay diferencia.'
            : error === 'ARQUEO_YA_SOLICITADO'
              ? 'Ya hay un arqueo solicitado: espera la validación del supervisor.'
              : error === 'MIGRACION_CAJA_ARQUEO_PENDIENTE'
                ? 'El módulo de arqueo aún no está aplicado en el servidor.'
                : error}
        </div>
      )}

      <button
        className="y-btn primary"
        style={{ width: '100%', marginTop: 14, minHeight: 42 }}
        disabled={enviando || !observacionValida}
        onClick={() => void enviar()}
      >
        {enviando ? 'Registrando…' : 'Registrar arqueo y solicitar cierre'}
      </button>
    </div>
  );
}
