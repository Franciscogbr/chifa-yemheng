import { useCallback, useEffect, useState } from 'react';
import {
  registrarArqueo,
  type ArqueoResultado,
  verMovimientosResumen,
  type MovimientoResumen,
} from '../staff-service';

const fmt = (n: number) => `S/ ${n.toFixed(2)}`;

interface Props {
  cajaId: number;
  aperturaId: number;
  cajaNombre: string;
  saldoTeorico: number;
  onHecho: (msg: string) => void;
}

export function CajaArqueo({ cajaId, aperturaId, cajaNombre, saldoTeorico, onHecho }: Props) {
  const [resumen, setResumen] = useState<MovimientoResumen | null>(null);
  const [cargando, setCargando] = useState(true);
  const [observacion, setObservacion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ArqueoResultado | null>(null);

  useEffect(() => {
    setCargando(true);
    setError(null);
    void verMovimientosResumen(aperturaId)
      .then((r) => {
        setResumen(r);
        setCargando(false);
      })
      .catch((e) => {
        setError((e as Error).message);
        setCargando(false);
      });
  }, [aperturaId]);

  const contadoDelSistema = resumen?.total ?? 0;
  const totalTransacciones = resumen?.movimientos.reduce((sum, m) => sum + m.cantidad, 0) ?? 0;
  const dif = Math.round((contadoDelSistema - saldoTeorico) * 100) / 100;
  const cuadrada = dif === 0;

  const enviar = useCallback(async () => {
    setError(null);
    setEnviando(true);
    try {
      const r = await registrarArqueo({
        cajaId,
        denominaciones: [],
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
  }, [cajaId, cajaNombre, observacion, onHecho]);

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
          {resultado.idIncidencia != null && (
            <li>Incidencia #{resultado.idIncidencia} creada y visible en la bandeja.</li>
          )}
        </ul>
      </div>
    );
  }

  return (
    <div className="caja-validaciones y-panel y-panel-card" aria-label="Arqueo del turno">
      <div className="caja-section-heading">
        <h2>Arqueo automático del turno · {cajaNombre}</h2>
        <span className="caja-count">🧾</span>
      </div>

      {cargando ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 10 }}>
          Cargando movimientos del turno…
        </p>
      ) : error ? (
        <div className="y-chip bad" style={{ marginTop: 10 }}>
          {error}
        </div>
      ) : (
        <>
          <table
            style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10, fontSize: 13 }}
          >
            <thead>
              <tr
                style={{
                  textAlign: 'left',
                  color: 'var(--text-muted)',
                  fontSize: 11,
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <th style={{ padding: '8px 4px' }}>Medio de pago</th>
                <th style={{ padding: '8px 4px', textAlign: 'right' }}>Transacciones</th>
                <th style={{ padding: '8px 4px', textAlign: 'right' }}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {resumen?.movimientos.map((m) => (
                <tr
                  key={m.medio}
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <td style={{ padding: '8px 4px' }}>{m.medio}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                    {m.cantidad}
                  </td>
                  <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                    {fmt(m.monto)}
                  </td>
                </tr>
              ))}
              {resumen?.movimientos.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    style={{ padding: '8px 4px', color: 'var(--text-muted)' }}
                  >
                    No hay movimientos de ingreso registrados en este turno.
                  </td>
                </tr>
              )}
              <tr
                style={{
                  fontWeight: 'bold',
                  borderTop: '2px solid var(--border)',
                }}
              >
                <td style={{ padding: '8px 4px' }}>Total teórico del sistema</td>
                <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                  {totalTransacciones}
                </td>
                <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                  {fmt(contadoDelSistema)}
                </td>
              </tr>
            </tbody>
          </table>

          <div
            style={{
              marginTop: 12,
              fontSize: 13,
              color: cuadrada ? 'var(--color-success)' : '#dc2626',
            }}
          >
            <b>Saldo teórico: {fmt(saldoTeorico)}</b> ·
            <b>Diferencia (sistema − teórico): {fmt(dif)}</b> {' '}
            <span style={{ marginLeft: 6 }}>
              {cuadrada ? '✔ Cuadrado' : '✖ Hay diferencia'}
            </span>
          </div>

          <label
            style={{
              display: 'grid',
              gap: 5,
              marginTop: 14,
              fontSize: 11,
              color: 'var(--text-muted)',
            }}
          >
            Observación (opcional)
            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              rows={2}
              maxLength={200}
              className="input"
              placeholder="Ej: observación del arqueo automático"
            />
          </label>

          <button
            className="y-btn primary"
            style={{ width: '100%', marginTop: 14, minHeight: 42, background: '#A61E22', borderColor: '#A61E22', color: '#fff' }}
            disabled={enviando}
            onClick={() => void enviar()}
          >
            {enviando ? 'Registrando…' : 'Registrar arqueo automático y solicitar cierre'}
          </button>
        </>
      )}
    </div>
  );
}
