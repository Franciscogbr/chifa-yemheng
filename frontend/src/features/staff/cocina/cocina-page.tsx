import { useCallback, useEffect, useMemo, useState } from 'react';
import { ErrorBox, Loading, PageHeader } from '../../../components/ui';
import { Ico } from '../../../components/Icon';
import { timeAgo } from '../../../lib/format';
import {
  cambiarPreparacion,
  listarPedidosCocina,
  type EstadoPreparacion,
  type Ticket,
  type TicketLinea,
} from '../staff-service';
import { EstadoBadge } from '../../../shared/ui/EstadoBadge';
import { supabase } from '../../../shared/services/supabase';
import { StaffFeedbackModal, type StaffFeedback } from '../staff-feedback-modal';

const TONE: Record<string, string> = { P: '#f59e0b', L: '#22c55e', A: '#ef4444' };

function describirErrorCocina(error: unknown, fallback: string): string {
  const raw = error instanceof Error ? error.message : '';
  const code = raw.split(':', 1)[0]?.trim().toUpperCase() ?? '';
  const known: Record<string, string> = {
    NOT_FOUND: 'La comanda o el producto ya no está disponible. Actualiza el tablero.',
    VALIDATION_ERROR: 'No se pudo aplicar ese cambio. Actualiza el tablero e inténtalo nuevamente.',
    NETWORK_ERROR: 'No se pudo conectar. Revisa la conexión e inténtalo nuevamente.',
    TRANSICION_ESTADO_INVALIDA: 'El estado del producto cambió en otro dispositivo. Actualiza el tablero.',
  };
  if (known[code]) return known[code];
  if (code.startsWith('DB_') || /failed to fetch|networkerror/i.test(raw)) {
    return 'No se pudo conectar con el servicio. Revisa la conexión e inténtalo nuevamente.';
  }
  return fallback;
}

export function StaffCocinaPage() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<StaffFeedback | null>(null);

  const cargar = useCallback(async () => {
    try {
      setTickets(await listarPedidosCocina());
      setError(null);
    } catch (e) {
      setError(describirErrorCocina(e, 'No se pudo cargar la cocina. Intenta actualizar el tablero.'));
    }
  }, []);

  useEffect(() => {
    void cargar();
    let debounceTimer: number | null = null;
    const trigger = () => {
      if (debounceTimer) window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => void cargar(), 200);
    };
    const channel = supabase
      .channel('cocina:detalles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'detalle_pedido' }, trigger)
      .subscribe();
    return () => {
      if (debounceTimer) window.clearTimeout(debounceTimer);
      void supabase.removeChannel(channel);
    };
  }, [cargar]);

  const mover = useCallback(
    async (ticketId: number, detalleId: number, estado: EstadoPreparacion) => {
      setBusy(detalleId);
      try {
        await cambiarPreparacion(ticketId, detalleId, estado);
        await cargar();
      } catch (e) {
        setFeedback({
          kind: 'error',
          title: 'No se pudo actualizar el producto',
          description: describirErrorCocina(e, 'Actualiza el tablero e inténtalo nuevamente.'),
        });
      } finally {
        setBusy(null);
      }
    },
    [cargar],
  );

  const conteo = useMemo(() => {
    const p = tickets?.filter((t) => t.detalles.some((d) => d.estadoPreparacion === 'P')).length ?? 0;
    const l = tickets?.filter((t) => t.detalles.some((d) => d.estadoPreparacion === 'L')).length ?? 0;
    return { p, l };
  }, [tickets]);

  const grupos: { clave: EstadoPreparacion; titulo: string }[] = [
    { clave: 'P', titulo: 'Pendientes' },
    { clave: 'L', titulo: 'Listos' },
  ];

  return (
    <div className="y-shell" style={{ padding: '24px 16px 140px', maxWidth: 1240, margin: '0 auto' }}>
      <PageHeader
        title="Cocina (KDS)"
        sub="Tablero de comandas en preparación."
        right={(
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <EstadoChip estado="P" texto={`${conteo.p} pend`} />
            <EstadoChip estado="L" texto={`${conteo.l} listo`} />
            <button className="btn btn-ghost" onClick={() => void cargar()}>Refrescar</button>
          </div>
        )}
      />
      {error && <ErrorBox msg={error} retry={cargar} />}
      {tickets === null && error === null && <Loading text="Cargando comandas..." />}
      {tickets?.length === 0 && !error && (
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <Ico n="chef" size={40} />
          <h3 style={{ margin: '8px 0 0' }}>No hay comandas activas</h3>
          <p style={{ color: 'var(--text-muted)' }}>Cuando lleguen pedidos, se verán aquí.</p>
        </div>
      )}
      {tickets && tickets.length > 0 && !error && (
        <div className="ys-board">
          {grupos.map((g) => (
            <div key={g.clave} className="ys-col card">
              <h3 style={{ color: TONE[g.clave] }}>{g.titulo}</h3>
              {tickets
                .filter((t) => t.detalles.some((d) => d.estadoPreparacion === g.clave))
                .map((t) => (
                  <div key={`${g.clave}-${t.id}`} className="ys-ticket" style={{ ['--tone' as string]: TONE[g.clave] }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontWeight: 700 }}>
                      <span>{t.numero}</span>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 11 }}>{timeAgo(t.fecha)}</span>
                    </div>
                    <p style={{ margin: '2px 0 8px', fontSize: 12, color: 'var(--text-muted)' }}>
                      {t.mesaId ? `Mesa ${t.mesaId} · ` : 'Delivery · '}
                      {t.comensales || 1} pax · S/ {(t.total ?? 0).toFixed(2)}
                    </p>
                    {t.detalles
                      .filter((d) => d.estadoPreparacion === g.clave)
                      .map((d) => (
                        <DetalleLinea key={d.id} ticket={t} d={d} busy={busy === d.id} onMove={mover} />
                      ))}
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
      {feedback && (
        <StaffFeedbackModal
          feedback={feedback}
          onClose={() => setFeedback(null)}
          onAction={async () => {
            setTickets(await listarPedidosCocina());
            setError(null);
          }}
          actionLabel="Actualizar tablero"
        />
      )}
    </div>
  );
}

function EstadoChip({ estado, texto }: { estado: string; texto: string }) {
  return (
    <span className="ys-status" style={{ color: TONE[estado], background: `${TONE[estado]}22` }}>
      <i />
      {texto}
    </span>
  );
}

function DetalleLinea({
  ticket,
  d,
  busy,
  onMove,
}: {
  ticket: Ticket;
  d: TicketLinea;
  busy: boolean;
  onMove: (t: number, d: number, e: EstadoPreparacion) => Promise<void>;
}) {
  const estado = d.estadoPreparacion;
  return (
    <div style={{ display: 'grid', gap: 6, padding: '8px 0', borderTop: '1px solid var(--line2)' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <EstadoBadge estado={estado} size="lg" />
        <b style={{ minWidth: 22 }}>{d.cantidad}x</b>
        <span style={{ flex: 1 }}>{d.producto}</span>
      </div>
      {d.notaCocina && <p style={{ margin: 0, fontSize: 12, color: 'var(--gold-light)' }}>{d.notaCocina}</p>}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {estado === 'P' && (
          <button className="btn btn-gold" disabled={busy} onClick={() => void onMove(ticket.id, d.id, 'L')}>
            Marcar listo
          </button>
        )}
        {estado !== 'L' && estado !== 'A' && (
          <button
            className="btn btn-ghost"
            disabled={busy}
            style={{ color: '#fca5a5' }}
            onClick={() => void onMove(ticket.id, d.id, 'A')}
          >
            Anular
          </button>
        )}
      </div>
    </div>
  );
}
