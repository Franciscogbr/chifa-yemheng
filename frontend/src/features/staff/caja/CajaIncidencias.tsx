import { useCallback, useEffect, useState } from 'react';
import { Ico } from '../../../components/Icon';
import {
  listarIncidencias,
  rechazarArqueo,
  resolverIncidencia,
  type IncidenciaCajaInfo,
} from '../staff-service';

const fmt = (n: number) => `S/ ${Math.abs(n).toFixed(2)}`;

interface Props {
  puedeValidar: boolean;
  onChanged: (msg: string) => void;
}

export function CajaIncidencias({ puedeValidar, onChanged }: Props) {
  const [incidencias, setIncidencias] = useState<IncidenciaCajaInfo[]>([]);
  const [cargando, setCargando] = useState(false);
  const [detalle, setDetalle] = useState<IncidenciaCajaInfo | null>(null);
  const [estadoNuevo, setEstadoNuevo] = useState<'EN_REVISION' | 'JUSTIFICADA' | 'CERRADA'>('EN_REVISION');
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      setIncidencias(await listarIncidencias(true));
    } catch {
      setIncidencias([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function resolver() {
    if (!detalle) return;
    setError(null);
    try {
      await resolverIncidencia(detalle.id, { estado: estadoNuevo, comentario });
      setDetalle(null);
      setComentario('');
      onChanged(`Incidencia #${detalle.id} → ${estadoNuevo}.`);
      await cargar();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function rechazar(inc: IncidenciaCajaInfo) {
    setError(null);
    try {
      await rechazarArqueo(inc.aperturaId);
      onChanged(
        `Arqueo rechazado: el turno volvió a abierta para que el cajero re-cuente. Incidencia #${inc.id} queda registrada.`,
      );
      await cargar();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <section className="y-panel y-panel-card caja-validaciones" aria-labelledby="incidencias-title">
      <div className="caja-section-heading">
        <h2 id="incidencias-title">Incidencias de caja</h2>
        <button className="y-btn ghost y-btn sm" onClick={() => void cargar()} disabled={cargando}>
          <Ico n="edit" size={14} /> {cargando ? 'Cargando…' : 'Refrescar'}
        </button>
      </div>

      {error && <div className="y-chip bad">{error === 'COMENTARIO_REQUERIDO' ? 'El comentario es obligatorio para justificar/cerrar.' : error}</div>}

      {incidencias.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
          Sin incidencias pendientes. Las diferencias menores al arqueo no generan incidencia.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {incidencias.map((inc) => (
            <div key={inc.id} className="caja-cierre-pendiente">
              <div>
                <b>
                  #{inc.id} · {inc.nivel === 'CRITICA' ? '🔴 CRÍTICA' : '🟠 MEDIA'}
                </b>
                <span>Apertura {inc.aperturaId} · caja {inc.cajaId} · cajero {inc.cajeroId}</span>
                <small>{new Date(inc.fecha).toLocaleString()}</small>
              </div>
              <span className={inc.nivel === 'CRITICA' ? 'y-chip bad' : 'y-chip warn'}>
                {inc.estado} {fmt(inc.diferencia)}
              </span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="y-btn primary y-btn sm" onClick={() => { setDetalle(inc); setEstadoNuevo('EN_REVISION'); }}>
                  Resolver
                </button>
                {puedeValidar && inc.estado === 'PENDIENTE' && (
                  <button className="y-btn line y-btn sm" onClick={() => void rechazar(inc)} title="Devuelve el turno al cajero para re-cuento">
                    Rechazar arqueo
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {detalle && (
        <div className="caja-cierre-form" style={{ marginTop: 14 }}>
          <label>
            Estado destino
            <select value={estadoNuevo} onChange={(e) => setEstadoNuevo(e.target.value as typeof estadoNuevo)} className="input">
              <option value="EN_REVISION">En revisión</option>
              <option value="JUSTIFICADA">Justificada</option>
              <option value="CERRADA">Cerrada</option>
            </select>
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            Comentario de resolución {estadoNuevo !== 'EN_REVISION' && '(obligatorio)'}
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={2}
              maxLength={300}
              className="input"
              placeholder="Ej: faltante justificado por ticket descontado personal"
            />
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="y-btn primary" onClick={() => void resolver()} disabled={estadoNuevo !== 'EN_REVISION' && comentario.trim().length === 0}>
              Guardar resolución
            </button>
            <button className="y-btn line" onClick={() => setDetalle(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
