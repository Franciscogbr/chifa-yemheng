import { useEffect, useRef, useState } from 'react';
import { leerToken } from '../../auth/login/auth-service';

import { API_URL } from '../../../lib/api-url';

const BASE = `${API_URL}/auditoria`;

interface Auditoria {
  id: number;
  usuarioId: number | null;
  usuario: string | null;
  tabla: string;
  accion: string;
  idRegistro: number | null;
  valorAnterior: string | null;
  valorNuevo: string | null;
  motivo: string | null;
  fecha: string;
  ip: string | null;
  terminal: string | null;
}

interface AuditoriaLista {
  data: Auditoria[];
  page: number;
  limit: number;
  total: number;
}

async function listar(f: { page: number; limit: number; usuarioId: string; tabla: string; accion: string; desde: string; hasta: string }): Promise<AuditoriaLista> {
  const q = new URLSearchParams({ page: String(f.page), limit: String(f.limit) });
  if (f.usuarioId) q.set('usuarioId', f.usuarioId);
  if (f.tabla) q.set('tabla', f.tabla);
  if (f.accion) q.set('accion', f.accion);
  if (f.desde) q.set('desde', f.desde);
  if (f.hasta) q.set('hasta', f.hasta);
  const res = await fetch(`${BASE}?${q.toString()}`, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${leerToken() ?? ''}` } });
  if (!res.ok) throw new Error(`HTTP_${res.status}`);
  return res.json();
}

const LIMITE = 20;

export function AdminAuditoriaPage() {
  const [page, setPage] = useState(1);
  const [usuarioId, setUsuarioId] = useState('');
  const [tabla, setTabla] = useState('');
  const [accion, setAccion] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [datos, setDatos] = useState<Auditoria[]>([]);
  const [detalle, setDetalle] = useState<Auditoria | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await listar({ page, limit: LIMITE, usuarioId, tabla, accion, desde, hasta });
      setDatos(res.data);
      setTotal(res.total);
    } catch (cause) {
      if (cause instanceof Error && cause.message === 'HTTP_401') {
        setError('Tu sesión venció. Cierra sesión y vuelve a ingresar.');
      } else if (cause instanceof Error && cause.message === 'HTTP_403') {
        setError('Tu usuario no tiene el permiso AUD_VER para consultar la auditoría.');
      } else {
        setError('No fue posible cargar la auditoría. Verifica la conexión e inténtalo nuevamente.');
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { void cargar(); }, [page, usuarioId, tabla, accion, desde, hasta]);

  useEffect(() => {
    if (detalle && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  }, [detalle]);

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE));

  return (
    <div className="y-shell" style={{ padding: '24px 16px 140px', maxWidth: 1240, margin: '0 auto' }}>
      <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--fg)' }}>Auditoría</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        <input type="number" min="1" step="1" placeholder="ID de usuario" value={usuarioId} onChange={(e) => { setUsuarioId(e.target.value); setPage(1); }} className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm" />
        <input placeholder="Tabla" value={tabla} onChange={(e) => { setTabla(e.target.value); setPage(1); }} className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm" />
        <input placeholder="Acción" value={accion} onChange={(e) => { setAccion(e.target.value); setPage(1); }} className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm" />
        <input type="date" value={desde} onChange={(e) => { setDesde(e.target.value); setPage(1); }} className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm" />
        <input type="date" value={hasta} onChange={(e) => { setHasta(e.target.value); setPage(1); }} className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm" />
      </div>

      {error ? (
        <div role="alert" className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">{error}</div>
      ) : cargando ? (
        <div className="y-panel" style={{ padding: 24, textAlign: 'center' }}>Cargando...</div>
      ) : datos.length === 0 ? (
        <div className="y-panel" style={{ padding: 24, textAlign: 'center' }}>No hay registros de auditoría.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F5F5F5] text-left text-xs uppercase tracking-wider text-[#333]/60">
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Usuario</th>
                <th className="px-3 py-2">Tabla</th>
                <th className="px-3 py-2">Acción</th>
                <th className="px-3 py-2">Registro</th>
                <th className="px-3 py-2">Fecha</th>
                <th className="px-3 py-2">Terminal</th>
                <th className="px-3 py-2">IP</th>
                <th className="px-3 py-2">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F5]">
              {datos.map((a) => (
                <tr key={a.id} className="hover:bg-[#F5F5F5]">
                  <td className="px-3 py-2">{a.id}</td>
                  <td className="px-3 py-2">{a.usuario ? `${a.usuario} (#${a.usuarioId ?? '—'})` : a.usuarioId ? `#${a.usuarioId}` : '—'}</td>
                  <td className="px-3 py-2">{a.tabla}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold">{a.accion}</span>
                  </td>
                  <td className="px-3 py-2">{a.idRegistro ?? '—'}</td>
                  <td className="px-3 py-2">{new Date(a.fecha).toLocaleString()}</td>
                  <td className="px-3 py-2">{a.terminal || '—'}</td>
                  <td className="px-3 py-2">{a.ip || '—'}</td>
                  <td className="px-3 py-2">
                    <button type="button" onClick={() => setDetalle(a)} className="font-semibold text-blue-700 hover:underline">
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detalle && (
        <dialog
          ref={dialogRef}
          aria-labelledby="auditoria-detalle-titulo"
          onClose={() => setDetalle(null)}
          onClick={(event) => {
            if (event.target === dialogRef.current) {
              dialogRef.current?.close();
            }
          }}
          className="m-auto max-h-[90vh] w-[min(760px,calc(100%-2rem))] overflow-y-auto rounded-2xl bg-white p-0 text-[#242424] shadow-2xl backdrop:bg-black/50"
        >
          <div className="sticky top-0 flex items-start justify-between gap-4 border-b bg-white px-5 py-4">
            <div>
              <h2 id="auditoria-detalle-titulo" className="text-xl font-bold">Detalle de auditoría</h2>
              <p className="mt-1 text-sm text-gray-600">{describirAccion(detalle)}</p>
            </div>
            <button type="button" autoFocus onClick={() => dialogRef.current?.close()} aria-label="Cerrar detalle" className="rounded-lg px-3 py-1 text-xl text-gray-600 hover:bg-gray-100">
              ×
            </button>
          </div>
          <div className="grid gap-5 p-5">
            <section aria-label="Motivo del cambio" className="rounded-xl bg-amber-50 p-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-amber-900">Motivo</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm text-amber-950">{motivoAuditoria(detalle)}</p>
            </section>

            <section>
              <h3 className="mb-2 text-base font-bold">Cambios</h3>
              {detalle.accion === 'CAMBIO_CLAVE' ? (
                <p className="rounded-xl bg-gray-50 p-4 text-sm">
                  Contraseña actualizada. La contraseña anterior, la nueva y sus hashes se mantienen protegidos.
                </p>
              ) : (
                <TablaCambios anterior={detalle.valorAnterior} nuevo={detalle.valorNuevo} />
              )}
            </section>

            <section>
              <h3 className="mb-2 text-base font-bold">Datos del evento</h3>
              <dl className="grid gap-3 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2">
                <DatoEvento label="Usuario" value={detalle.usuario ? `${detalle.usuario}${detalle.usuarioId ? ` (#${detalle.usuarioId})` : ''}` : detalle.usuarioId ? `#${detalle.usuarioId}` : 'No disponible'} />
                <DatoEvento label="Fecha y hora" value={new Date(detalle.fecha).toLocaleString()} />
                <DatoEvento label="Acción" value={detalle.accion} />
                <DatoEvento label="Tabla" value={detalle.tabla} />
                <DatoEvento label="Registro" value={detalle.idRegistro === null ? 'No aplica' : `#${detalle.idRegistro}`} />
                <DatoEvento label="Terminal" value={detalle.terminal || 'No disponible'} />
                <DatoEvento label="IP" value={detalle.ip || 'No disponible'} />
              </dl>
            </section>
          </div>
        </dialog>
      )}

      <div className="flex items-center justify-center gap-2 mt-4">
        <button disabled={page <= 1} onClick={() => setPage((x) => Math.max(1, x - 1))} className="rounded-lg bg-white px-3 py-1.5 shadow-sm disabled:opacity-50">← Anterior</button>
        <span className="text-sm">Página {page} de {totalPaginas}</span>
        <button disabled={page >= totalPaginas} onClick={() => setPage((x) => x + 1)} className="rounded-lg bg-white px-3 py-1.5 shadow-sm disabled:opacity-50">Siguiente →</button>
      </div>
    </div>
  );
}

function motivoAuditoria(evento: Auditoria): string {
  if (evento.motivo?.trim()) return evento.motivo;
  if ((evento.accion === 'CAMBIO_CLAVE' && evento.usuarioId === evento.idRegistro) ||
      evento.accion === 'LOGIN' || evento.accion === 'LOGOUT') {
    return 'No aplica';
  }
  if (['USUARIO', 'ROL', 'ROL_PERMISO'].includes(evento.tabla.toUpperCase())) {
    return 'No registrado';
  }
  return 'No aplica';
}

function describirAccion(evento: Auditoria): string {
  if (evento.accion === 'CAMBIO_CLAVE') return 'Se actualizó la contraseña de una cuenta.';
  if (evento.accion === 'LOGIN') return 'Un usuario inició sesión.';
  if (evento.accion === 'LOGOUT') return 'Un usuario cerró sesión.';
  return `${evento.accion.replaceAll('_', ' ').toLowerCase()} en ${evento.tabla.toLowerCase()}.`;
}

function parsearObjeto(valor: string | null): Record<string, unknown> | null {
  if (!valor) return null;
  try {
    const parsed: unknown = JSON.parse(valor);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return null;
  }
  return null;
}

function esDatoSensible(campo: string): boolean {
  return /(clave|password|contrase|hash|token|secret)/i.test(campo);
}

function etiquetaCampo(campo: string): string {
  const etiquetas: Record<string, string> = {
    logeo: 'Usuario',
    id_tipousuario: 'Tipo de usuario (ID)',
    id_empleado: 'Empleado (ID)',
    bloqueado: 'Bloqueo',
    estado: 'Estado',
    n_rol: 'Nombre del rol',
    descripcion: 'Descripción',
    nivel: 'Nivel',
    id_rol: 'Rol (ID)',
    id_permiso: 'Permiso (ID)',
    concedido: 'Permiso concedido',
    descuento: 'Descuento',
    total: 'Total',
    anulado: 'Anulado',
    facturado: 'Facturado',
    id_estadopedido: 'Estado del pedido (ID)',
  };
  return etiquetas[campo] ?? campo.replaceAll('_', ' ').replace(/^\w/, (letra) => letra.toUpperCase());
}

function valorLegible(campo: string, valor: unknown): string {
  if (valor === null || valor === undefined || valor === '') return 'No definido';
  if (typeof valor === 'boolean') return valor ? 'Sí' : 'No';
  const text = String(valor);
  if (['estado', 'bloqueado', 'anulado', 'facturado'].includes(campo.toLowerCase())) {
    if (text === 'A') return 'Activo';
    if (text === 'I') return 'Inactivo';
    if (text === 'S') return 'Sí';
    if (text === 'N') return 'No';
  }
  if (campo.toLowerCase().startsWith('id_')) return `#${text}`;
  return text;
}

function TablaCambios({ anterior, nuevo }: { anterior: string | null; nuevo: string | null }) {
  const valoresAnteriores = parsearObjeto(anterior);
  const valoresNuevos = parsearObjeto(nuevo);
  if (!valoresAnteriores && !valoresNuevos) {
    return <p className="rounded-xl bg-gray-50 p-4 text-sm">Este evento no contiene cambios de campos para mostrar.</p>;
  }

  const campos = [...new Set([
    ...Object.keys(valoresAnteriores ?? {}),
    ...Object.keys(valoresNuevos ?? {}),
  ])].filter((campo) => !esDatoSensible(campo));
  const cambios = campos.filter((campo) =>
    JSON.stringify(valoresAnteriores?.[campo]) !== JSON.stringify(valoresNuevos?.[campo]),
  );
  if (cambios.length === 0) {
    return <p className="rounded-xl bg-gray-50 p-4 text-sm">No hay campos comparables en este evento.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[420px] text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-600">
          <tr>
            <th className="px-4 py-3">Campo</th>
            <th className="px-4 py-3">Antes</th>
            <th className="px-4 py-3">Después</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {cambios.map((campo) => (
            <tr key={campo}>
              <th scope="row" className="px-4 py-3 font-semibold">{etiquetaCampo(campo)}</th>
              <td className="px-4 py-3">{valorLegible(campo, valoresAnteriores?.[campo])}</td>
              <td className="px-4 py-3">{valorLegible(campo, valoresNuevos?.[campo])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DatoEvento({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 break-words">{value}</dd>
    </div>
  );
}
