import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Minus, Plus, CalendarCheck, CalendarDays, ClipboardCheck, Clock3, Coins, MessageSquareText, UsersRound, X } from 'lucide-react';
import { fmtDate, fmtPEN, errText } from '../lib/format';
import { Txt } from './Icon';
import type { Reserva } from '../types/db';

const SIT: Record<string, [string, string]> = { P: ['Pendiente', 'warn'], C: ['Confirmada', 'ok'], A: ['Atendida', 'ok'], X: ['Cancelada', 'bad'] };

export function ReservaCard({
  r,
  nombre,
  onContinuar,
  onCancelar,
  busy = false,
}: {
  r: Reserva;
  nombre?: string;
  onContinuar?: (reserva: Reserva) => void;
  onCancelar?: (reserva: Reserva) => void;
  busy?: boolean;
}) {
  const [txt, tone] = SIT[String(r.situacion)] ?? [String(r.situacion ?? '-'), 'warn'];
  const puedeContinuar =
    (r.pedido_id != null || (r.situacion === 'A' && r.id_mesa != null && r.canal_atencion !== 'MOZO')) && onContinuar;
  const puedeCancelar = !r.pedido_id && ['P', 'C', 'A'].includes(String(r.situacion)) && onCancelar;
  return (
    <motion.div className="y-panel y-rcard" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="y-avatar">{(nombre ?? r.cliente_nombre ?? 'R').charAt(0).toUpperCase()}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <b style={{ fontSize: 14 }}>{nombre ?? r.cliente_nombre ?? `Reserva #${r.id_reserva}`}</b>
        <div style={{ color: 'var(--muted)', fontSize: 12, margin: '3px 0 6px' }}>{fmtDate(r.f_reserva)} · {r.n_personas} personas{r.adelanto ? ` · Adelanto ${fmtPEN(r.adelanto)}` : ''}</div>
        <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className={`y-chip ${tone}`}>{txt}</span>
          <span className="y-chip" style={{ background: 'rgba(255,255,255,.06)', color: 'var(--muted)' }}>{r.id_mesa ? `Mesa ${r.mesa_numero ?? r.id_mesa} asignada` : 'Sin mesa aún'}</span>
          {r.f_llegada && (
            <span className="y-chip" style={{ background: 'rgba(34,197,94,.12)', color: '#4ade80' }}>
              Llegada registrada{r.canal_atencion ? ` · ${r.canal_atencion === 'QR' ? 'QR' : 'mozo'}` : ''}
            </span>
          )}
          {r.canal_atencion === 'MOZO' && !r.pedido_id && (
            <span className="y-chip" role="status">Solicitud al mozo enviada</span>
          )}
        </span>
        {(puedeContinuar || puedeCancelar) && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {puedeContinuar && (
              <button
                type="button"
                className="y-btn red sm"
                disabled={busy}
                onClick={() => onContinuar(r)}
              >
                {r.pedido_id ? <ClipboardCheck size={15} /> : <ArrowRight size={15} />}
                {r.pedido_id
                  ? 'Ver seguimiento'
                  : r.canal_atencion === 'QR'
                    ? 'Continuar por QR'
                    : 'Elegir cómo pedir'}
              </button>
            )}
            {puedeCancelar && (
              <button
                type="button"
                className="y-btn line sm"
                disabled={busy}
                onClick={() => onCancelar(r)}
              >
                <X size={15} />
                {busy ? 'Cancelando…' : 'Cancelar reserva'}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function ReservaForm({ onDone, baseUrl, token }: { onDone: () => void; baseUrl?: string; token?: string | null }) {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('20:00');
  const [personas, setPersonas] = useState(2);
  const [adelanto, setAdelanto] = useState(0);
  const [obs, setObs] = useState('');
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  const hoy = new Date();
  const fechaMinima = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!fecha) { setMsg('Elige la fecha.'); return; }
    if (baseUrl && !token) { setMsg('Tu sesión venció. Inicia sesión nuevamente para solicitar una reserva.'); return; }
    setBusy(true); setMsg('');
    try {
      const body = JSON.stringify({
        fecha,
        hora,
        comensales: personas,
        adelanto,
        observacion: obs || undefined,
      });
      const res = await fetch(baseUrl ?? '/api/v1/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body,
      });
      const data = await res.json().catch(() => ({})) as { error?: string; details?: string };
      if (!res.ok) {
        const messages: Record<string, string> = {
          CREDENCIALES_INVALIDAS: 'Tu sesión venció. Inicia sesión nuevamente.',
          TOKEN_INVALIDO: 'Tu sesión venció. Inicia sesión nuevamente.',
          CLIENTE_NOT_FOUND: 'No encontramos tu cuenta de cliente. Vuelve a iniciar sesión.',
          DATOS_RESERVA_INVALIDOS: 'Revisa la cantidad de personas, el adelanto y la observación.',
          DB_CREATE_FAIL: data.details ?? 'No se pudo guardar la solicitud de reserva.',
        };
        throw new Error(messages[data.error ?? ''] ?? data.error ?? 'No se pudo registrar la reserva.');
      }
      setOk(true);
      setTimeout(onDone, 1500);
    } catch (e) { setMsg(`:err: ${errText(e, 'Error')}`); } finally { setBusy(false); }
  };

  if (ok) return (
    <motion.div className="y-panel" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: 28, textAlign: 'center' }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 12 }} style={{ color: '#4ade80', display: 'grid', placeItems: 'center' }}><CalendarCheck size={48} /></motion.div>
      <b style={{ display: 'block', margin: '10px 0 4px' }}>Reserva registrada</b>
      <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>Queda como pendiente y sin mesa. Te avisaremos cuando el personal la confirme.</p>
    </motion.div>
  );
  return (
    <form className="y-panel y-reserva-form" onSubmit={(event) => void save(event)}>
      <header className="y-reserva-form__header">
        <span className="y-reserva-form__icon"><CalendarCheck size={22} /></span>
        <div>
          <h2>Planifica tu visita</h2>
          <p>Completa los detalles y enviaremos tu solicitud al equipo.</p>
        </div>
      </header>

      <div className="y-reserva-form__fields">
        <div className="y-reserva-field">
          <label htmlFor="reserva-fecha">Fecha de visita</label>
          <div className="y-reserva-field__control">
            <CalendarDays size={18} aria-hidden="true" />
            <input id="reserva-fecha" type="date" className="input" value={fecha} min={fechaMinima} required onChange={(e) => setFecha(e.target.value)} />
          </div>
        </div>
        <div className="y-reserva-field">
          <label htmlFor="reserva-hora">Hora aproximada</label>
          <div className="y-reserva-field__control">
            <Clock3 size={18} aria-hidden="true" />
            <input id="reserva-hora" type="time" className="input" value={hora} required onChange={(e) => setHora(e.target.value)} />
          </div>
        </div>
        <div className="y-reserva-field">
          <label id="reserva-personas-label">Personas</label>
          <div className="y-reserva-quantity" role="group" aria-labelledby="reserva-personas-label">
            <UsersRound size={18} aria-hidden="true" />
            <button type="button" onClick={() => setPersonas((value) => Math.max(1, value - 1))} aria-label="Restar una persona" disabled={personas <= 1}>
              <Minus size={15} />
            </button>
            <output aria-live="polite">{personas}</output>
            <button type="button" onClick={() => setPersonas((value) => Math.min(20, value + 1))} aria-label="Agregar una persona" disabled={personas >= 20}>
              <Plus size={15} />
            </button>
            <span>{personas === 1 ? 'persona' : 'personas'}</span>
          </div>
        </div>
        <div className="y-reserva-field">
          <label htmlFor="reserva-adelanto">Adelanto <span>(opcional)</span></label>
          <div className="y-reserva-field__control">
            <Coins size={18} aria-hidden="true" />
            <input id="reserva-adelanto" type="number" min={0} step="0.01" className="input" value={adelanto} onChange={(e) => setAdelanto(Math.max(0, Number(e.target.value)))} />
            <span className="y-reserva-currency">S/</span>
          </div>
        </div>
        <div className="y-reserva-field y-reserva-field--full">
          <label htmlFor="reserva-observacion">¿Algo que debamos saber? <span>(opcional)</span></label>
          <div className="y-reserva-field__control y-reserva-field__control--textarea">
            <MessageSquareText size={18} aria-hidden="true" />
            <textarea id="reserva-observacion" className="textarea" rows={3} maxLength={200} value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Cumpleaños, preferencia de mesa u otra indicación..." />
          </div>
          <span className="y-reserva-character-count">{obs.length}/200</span>
        </div>
      </div>

      <p className="y-reserva-form__note">La solicitud quedará pendiente hasta que el equipo confirme disponibilidad.</p>
      <button className="y-btn red y-reserva-submit" type="submit" disabled={busy}>
        {busy ? 'Enviando solicitud…' : 'Solicitar reserva'}
        {!busy && <CalendarCheck size={18} />}
      </button>
      {msg && <p className="y-reserva-form__message" role="alert"><Txt>{msg}</Txt></p>}
    </form>
  );
}