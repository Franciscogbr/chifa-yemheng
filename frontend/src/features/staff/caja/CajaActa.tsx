import { useEffect, useState } from 'react';
import { verActaCierre, type ActaCierreInfo } from '../staff-service';

const fmt = (n: number) => `S/ ${n.toFixed(2)}`;

interface Props {
  aperturaId: number;
}

/** S5: acta de cierre (Z) — blanca y negra, imprimible como en los templates A4. */
export function CajaActa({ aperturaId }: Props) {
  const [acta, setActa] = useState<ActaCierreInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    verActaCierre(aperturaId).then(setActa).catch((e) => setError((e as Error).message));
  }, [aperturaId]);

  if (error) return <div className="y-chip bad">{error === 'TURNO_NO_ABIERTO' ? 'Turno no encontrado.' : error}</div>;
  if (!acta) return <p className="caja-muted">Cargando acta…</p>;

  return (
    <div className="acta-z" style={{ background: '#fff', color: '#1f1f1f', border: '1px solid #dcdcdc', borderRadius: 12, padding: '18px 14px', maxWidth: 340, margin: '0 auto', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', fontSize: 11.5, lineHeight: 1.45 }}>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #1f1f1f', paddingBottom: 8, marginBottom: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.15em' }}>YEMHENG</div>
        <div style={{ fontSize: 9.5, color: '#737373', marginTop: 2 }}>ACTA DE CIERRE DE CAJA (Z) ·={}</div>
      </div>

      <div style={{ borderBottom: '1px solid #dcdcdc', paddingBottom: 8, marginBottom: 8 }}>
        <div>Caja: <b>{acta.caja}</b> · Turno: <b>{acta.numeroTurno ?? '—'}</b></div>
        <div>Cajero: <b>{acta.cajero}</b></div>
        <div>Validador: <b>{acta.validador ?? '—'}</b></div>
        <div>Apertura: {acta.fechaApertura ? new Date(acta.fechaApertura).toLocaleString() : '—'}</div>
        <div>Cierre: {acta.fechaCierre ? new Date(acta.fechaCierre).toLocaleString() : '—'}</div>
      </div>

      {([
        ['Saldo inicial', acta.saldoInicial],
        ['+ Total ingresos', acta.totalIngresos],
        ['- Total egresos', acta.totalEgresos],
        ['= Saldo teórico', acta.saldoTeorico],
        ['Dinero contado', acta.dineroContado],
        ['Diferencia', acta.diferencia],
      ] as [string, number][]).map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #f0f0f0' }}>
          <span style={{ color: '#5b5b5b' }}>{k}</span>
          <b style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(v)}</b>
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2e2e2e', color: '#fff', padding: '6px 10px', margin: '8px 0', borderRadius: 4 }}>
        <span style={{ fontSize: 9.5, letterSpacing: '0.12em' }}>{acta.resultado}</span>
        <b style={{ fontVariantNumeric: 'tabular-nums', fontSize: 14 }}>{fmt(acta.diferencia)}</b>
      </div>

      {acta.conteo.length > 0 && (
        <>
          <div style={{ fontSize: 10, color: '#737373', marginTop: 6 }}>Conteo por denominación</div>
          {acta.conteo.map((d) => (
            <div key={d.valor} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', padding: '2px 0' }}>
              <span style={{ color: '#5b5b5b' }}>{fmt(d.valor)} × {d.cantidad} ({d.tipo.toLowerCase()})</span>
              <b style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(d.valor * d.cantidad)}</b>
            </div>
          ))}
        </>
      )}

      {acta.incidencia && (
        <div style={{ borderLeft: '3px solid #9a9a9a', background: '#f3f3f3', padding: '6px 10px', marginTop: 10 }}>
          <b>{acta.incidencia.nivel === 'CRITICA' ? 'CRÍTICA' : 'MEDIA'} · #{acta.incidencia.id} · {acta.incidencia.estado}</b>
          <div style={{ color: '#5b5b5b' }}>{acta.incidencia.motivo}</div>
          {acta.incidencia.comentarioResolucion && (
            <div style={{ color: '#5b5b5b' }}>Resolución: {acta.incidencia.comentarioResolucion}</div>
          )}
        </div>
      )}

      {acta.observacion && <div style={{ marginTop: 8, color: '#5b5b5b' }}>Observación: {acta.observacion}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 22, textAlign: 'center', color: '#5b5b5b', fontSize: 10 }}>
        <div>____________________<div>Cajero</div></div>
        <div>____________________<div>Supervisor</div></div>
      </div>

      <div style={{ marginTop: 12, paddingTop: 6, borderTop: '1px solid #1f1f1f', textAlign: 'center', fontSize: 9.5, color: '#737373' }}>
        Acta de cierre de caja y arqueo — documento de control interno.<br />
        Este acta no reemplaza a los comprobantes tributarios. Generada por el sistema.
      </div>

      <button className="y-btn primary" style={{ width: '100%', marginTop: 10 }} onClick={() => window.print()}>
        Imprimir / Guardar PDF
      </button>
    </div>
  );
}
