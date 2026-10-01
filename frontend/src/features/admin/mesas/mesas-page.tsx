import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  actualizarMesa,
  cambiarEstadoAmbiente,
  cambiarEstadoMesa,
  crearAmbiente,
  crearMesa,
  listarAmbientes,
  listarMesas,
  listarOcupacion,
} from './mesas-service';
import { MesaIcon } from './mesa-icon';
import { COLOR_POR_ESTADO, TIPOS_MESA } from './mesas-types';
import type { Ambiente, AmbienteForm, Mesa, MesaForm, OcupacionMesa } from './mesas-types';

const LIMITE = 20;
type Tab = 'mapa' | 'mesas' | 'ambientes';

const VACIO_MESA: MesaForm = { ambienteId: 0, numero: '', capacidad: 4, tipoId: 1, detalle: '', regenerarQr: false };
const VACIO_AMB: AmbienteForm = { nombre: '', descripcion: '', piso: 1 };

/** Base pública para las URLs de prueba del cliente (LAN o Vercel). */
const URL_BASE = import.meta.env.VITE_PUBLIC_URL ?? 'http://localhost:5174';

/** Extrae el código tras `/m/` de un Codigo_QR (`yemheng.pe/m/<CÓDIGO>`). */
function codigoDeQr(qr: string | null | undefined): string | null {
  const codigo = qr?.split('/m/')[1]?.trim();
  return codigo ? codigo : null;
}

/**
 * URL escaneable de prueba para el QR de la mesa
 * (`/cliente/login?mesa=<código>` o URL pelada si no hay código).
 */
function qrValor(qr: string | null | undefined): string {
  const codigo = codigoDeQr(qr);
  return codigo ? `${URL_BASE}/cliente/login?mesa=${encodeURIComponent(codigo)}` : `${URL_BASE}/cliente/login`;
}

function descargarQRPng(contenedorId: string, nombre: string): boolean {
  const cont = document.getElementById(contenedorId);
  const svg = cont?.querySelector('svg');
  if (!svg) {
    return false;
  }
  const data = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 512);
    ctx.drawImage(img, 0, 0, 512, 512);
    const a = document.createElement('a');
    a.download = `${nombre}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data)}`;
  return true;
}

function imprimirContenedor(contenedorId: string, titulo: string): boolean {
  const el = document.getElementById(contenedorId);
  if (!el) {
    return false;
  }
  const w = window.open('', '_blank', 'width=800,height=600');
  if (!w) {
    return false;
  }
  w.document.write(
    `<html><head><title>${titulo}</title><style>body{font-family:sans-serif;} .hoja{display:flex;flex-wrap:wrap;gap:24px;justify-content:center;padding:24px;} .item{display:flex;flex-direction:column;align-items:center;gap:8px;border:1px dashed #999;border-radius:12px;padding:16px;} .item strong{font-size:18px;} .item span{font-size:12px;color:#555;}</style></head><body><div class="hoja">${el.innerHTML}</div></body></html>`,
  );
  w.document.close();
  w.focus();
  w.print();
  return true;
}

/** /admin/mesas — Mapa (solo lectura) + ABM Mesas + Ambientes (mesas.md). */
export function MesasPage() {
  const [tab, setTab] = useState<Tab>('mapa');
  const [page, setPage] = useState(1);
  const [buscar, setBuscar] = useState('');
  const [texto, setTexto] = useState('');
  const [ambiente, setAmbiente] = useState<number | ''>('');
  const [datos, setDatos] = useState<Mesa[]>([]);
  const [total, setTotal] = useState(0);
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<null | { editando: Mesa | null }>(null);
  const [form, setForm] = useState<MesaForm>(VACIO_MESA);
  const [formError, setFormError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [modalAmb, setModalAmb] = useState(false);
  const [formAmb, setFormAmb] = useState<AmbienteForm>(VACIO_AMB);
  const [zonaMapa, setZonaMapa] = useState<number | 'all'>('all');
  const [detalle, setDetalle] = useState<Mesa | null>(null);
  const [hojaQR, setHojaQR] = useState<Ambiente | null>(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const [res, ambs, ocup] = await Promise.all([
        listarMesas({ page, limit: LIMITE, ambiente, estado: '', buscar }),
        listarAmbientes(),
        listarOcupacion().catch(() => [] as OcupacionMesa[]),
      ]);
      const porMesa = new Map(ocup.map((o) => [o.mesaId, o]));
      setDatos(res.data.map((m) => ({ ...m, ocupacion: porMesa.get(m.id) ?? null })));
      setTotal(res.total);
      setAmbientes(ambs);
    } catch {
      setError('No fue posible cargar las mesas.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, buscar, ambiente]);

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE));
  const porAmbiente = (id: number) => datos.filter((m) => m.ambienteId === id);
  const conteoEstado = (nombre: string) => datos.filter((m) => m.estadoOperativo === nombre).length;
  const numeroOriginal = modal?.editando?.numero.trim().toUpperCase() ?? '';
  const numeroNuevo = form.numero.trim().toUpperCase();
  const cambioNumero = !!modal?.editando && numeroNuevo !== '' && numeroNuevo !== numeroOriginal;

  const abrirNuevo = () => {
    setForm(VACIO_MESA);
    setFormError(null);
    setModal({ editando: null });
  };

  const abrirEditar = (m: Mesa) => {
    setForm({
      ambienteId: m.ambienteId,
      numero: m.numero,
      capacidad: m.capacidad,
      tipoId: m.tipoId,
      detalle: m.detalle ?? '',
      regenerarQr: false,
    });
    setFormError(null);
    setModal({ editando: m });
  };

  const guardar = async () => {
    if (!form.ambienteId) {
      setFormError('Seleccione el ambiente.');
      return;
    }
    if (!form.numero.trim() || form.numero.trim().length > 5) {
      setFormError('Número de 1 a 5 caracteres (BD). Ej. M-01, V-01.');
      return;
    }
    if (!(form.capacidad >= 1)) {
      setFormError('Capacidad mayor a 0.');
      return;
    }
    setGuardando(true);
    setFormError(null);
    try {
      if (modal?.editando) {
        await actualizarMesa(modal.editando.id, form);
      } else {
        await crearMesa(form);
      }
      setModal(null);
      await cargar();
    } catch (e) {
      const codigo = (e as Error).message;
      setFormError(
        codigo === 'YA_EXISTE'
          ? 'Ya existe ese número en el ambiente.'
          : codigo === 'AMBIENTE_INVALIDO'
            ? 'Ambiente inválido o inactivo.'
            : codigo === 'TIPO_INVALIDO'
              ? 'Tipo de mesa inválido.'
              : codigo === 'QR_DESINCRONIZADO'
                ? 'Cambiaste el número pero mantienes el QR viejo. Activa “Regenerar por seguridad” o revierte el número.'
                : codigo === 'NETWORK_ERROR'
                  ? 'Sin conexión con el servidor. Revisa la red e IP del backend.'
                  : 'No se pudo guardar. Reintente.',
      );
    } finally {
      setGuardando(false);
    }
  };

  const toggleEstado = async (m: Mesa) => {
    try {
      await cambiarEstadoMesa(m.id, m.estado === 'A' ? 'I' : 'A');
      await cargar();
    } catch {
      setError('No se pudo cambiar el estado.');
    }
  };

  const guardarAmbiente = async () => {
    if (!formAmb.nombre.trim()) {
      return;
    }
    try {
      await crearAmbiente(formAmb);
      setModalAmb(false);
      setFormAmb(VACIO_AMB);
      await cargar();
    } catch {
      setError('No se pudo crear el ambiente (¿nombre duplicado?).');
    }
  };

  const toggleAmbiente = async (a: Ambiente) => {
    try {
      await cambiarEstadoAmbiente(a.id, a.estado === 'A' ? 'I' : 'A');
      await cargar();
    } catch {
      setError('No se pudo cambiar el estado del ambiente.');
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 pb-12">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <nav className="flex items-center gap-2 text-[11px] tracking-wider text-[#333333]/60 uppercase">
            <span>Inicio</span>
            <span>/</span>
            <span className="font-bold text-[#A61E22]">Mesas</span>
          </nav>
          <h1 className="mt-1 font-[Newsreader] text-3xl font-medium text-[#7F1518]">
            Gestión de Mesas y Ambientes
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#333333]/70">
            Mapa en vivo (solo lectura), ABM de mesas y configuración de ambientes.
          </p>
        </div>
        <button
          onClick={abrirNuevo}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-[#A61E22] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#7F1518]"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Nueva Mesa</span>
        </button>
      </div>

      <div className="flex w-full max-w-md gap-1 rounded-xl bg-white p-1.5 shadow-sm">
        {(
          [
            { v: 'mapa', label: 'Mapa', icono: 'map' },
            { v: 'mesas', label: 'Mesas', icono: 'table_bar' },
            { v: 'ambientes', label: 'Ambientes', icono: 'meeting_room' },
          ] as { v: Tab; label: string; icono: string }[]
        ).map((t) => (
          <button
            key={t.v}
            onClick={() => setTab(t.v)}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all ${
              tab === t.v
                ? 'bg-[#F5F5F5] text-[#A61E22] shadow-sm'
                : 'text-[#333333]/60 hover:bg-[#F5F5F5] hover:text-[#333333]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{t.icono}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'mapa' && (
        <section className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl bg-white p-4 shadow-sm">
            <span className="text-sm font-semibold">Leyenda:</span>
            {['LIBRE', 'OCUPADA', 'RESERVADA', 'POR COBRAR', 'FUERA DE SERVICIO'].map((e) => (
              <span key={e} className="inline-flex items-center gap-2 text-sm">
                <MesaIcon
                  mini
                  numero=""
                  estado={e}
                  color={COLOR_POR_ESTADO[e] ?? '#6C757D'}
                  tipo="MESA ESTANDAR"
                  capacidad={4}
                />
                <strong>{e}</strong>
                <span className="text-[#333333]/50">({conteoEstado(e)})</span>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setZonaMapa('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase transition-colors ${zonaMapa === 'all' ? 'bg-[#A61E22] text-white shadow-sm' : 'bg-white text-[#333333]/60 shadow-sm hover:bg-[#F5F5F5]'}`}
            >
              Todos ({ambientes.length})
            </button>
            {ambientes.map((a) => (
              <button
                key={a.id}
                onClick={() => setZonaMapa(a.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase transition-colors ${zonaMapa === a.id ? 'bg-[#A61E22] text-white shadow-sm' : 'bg-white text-[#333333]/60 shadow-sm hover:bg-[#F5F5F5]'}`}
              >
                {a.nombre} ({porAmbiente(a.id).length})
              </button>
            ))}
          </div>
          {cargando ? (
            <Skeleton />
          ) : (
            ambientes
              .filter((amb) => zonaMapa === 'all' || amb.id === zonaMapa)
              .map((amb) => (
              <div key={amb.id} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-bold">
                    <span className="h-6 w-2.5 rounded-sm bg-[#A61E22]" />
                    {amb.nombre}
                  </h2>
                  <span className="text-sm text-[#333333]/60">
                    {porAmbiente(amb.id).length} mesas
                  </span>
                </div>
                <div
                  className="relative overflow-hidden rounded-2xl p-6 shadow-md select-none"
                  style={{
                    backgroundColor: '#D69F4B',
                    backgroundImage:
                      'repeating-linear-gradient(45deg, rgba(120,70,20,0.14) 0 14px, transparent 14px 28px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.07) 0 14px, transparent 14px 28px)',
                  }}
                >
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(to bottom, rgba(0,0,0,0.18), transparent 30%, transparent 70%, rgba(0,0,0,0.22))',
                    }}
                  />
                  <div className="relative flex flex-wrap items-start justify-center gap-x-8 gap-y-6">
                    {porAmbiente(amb.id).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setDetalle(m)}
                        className="flex flex-col items-center gap-1.5 rounded-xl p-2 transition-all hover:-translate-y-1 hover:bg-white/20 focus:outline-none"
                      >
                        <MesaIcon
                          numero={m.numero}
                          estado={m.estadoOperativo}
                          color={m.color}
                          tipo={m.tipo}
                          capacidad={m.capacidad}
                          atenuado={m.estado === 'I'}
                        />
                        <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] shadow-md">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: m.color }}
                          />
                          <strong>{m.numero}</strong>
                          <span className="text-[#333333]/60">
                            {m.ocupacion
                              ? `S/. ${m.ocupacion.total.toFixed(2)}`
                              : m.estadoOperativo}
                          </span>
                        </span>
                      </button>
                    ))}
                    {porAmbiente(amb.id).length === 0 && (
                      <p className="rounded-lg bg-black/25 px-3 py-1.5 text-sm font-medium text-white">
                        Sin mesas en este ambiente.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {tab === 'mesas' && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm md:flex-row md:items-center">
            <div className="relative w-full md:w-72">
              <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-[18px] text-[#333333]/40">
                search
              </span>
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setBuscar(texto);
                    setPage(1);
                  }
                }}
                placeholder="Filtrar por número…"
                className="w-full rounded-lg bg-[#F5F5F5] py-2 pr-4 pl-10 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[#A61E22]"
              />
            </div>
            <select
              value={ambiente}
              onChange={(e) => {
                setAmbiente(e.target.value === '' ? '' : Number(e.target.value));
                setPage(1);
              }}
              className="cursor-pointer rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm outline-none"
            >
              <option value="">Todos los ambientes</option>
              {ambientes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setBuscar(texto);
                setPage(1);
                void cargar();
              }}
              className="rounded-lg bg-[#F5F5F5] px-4 py-2 text-sm font-semibold transition-colors hover:bg-[#D9D9D9]"
            >
              Filtrar
            </button>
          </div>

          {cargando ? (
            <Skeleton />
          ) : error ? (
            <ErrorBox mensaje={error} reintentar={() => void cargar()} />
          ) : datos.length === 0 ? (
            <div className="rounded-xl bg-white p-10 text-center shadow-sm">
              <p className="text-lg font-semibold">No existen mesas registradas.</p>
              <button
                onClick={abrirNuevo}
                className="mt-4 cursor-pointer rounded-xl bg-[#A61E22] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7F1518] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A61E22]/50 active:scale-[0.99]"
              >
                Crear la primera
              </button>
            </div>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-xl bg-white shadow-sm md:block">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-[#F5F5F5] text-[11px] tracking-wider text-[#333333]/60 uppercase">
                        <th className="px-4 py-3">Número</th>
                        <th className="px-4 py-3">Ambiente</th>
                        <th className="px-4 py-3 text-center">Capacidad</th>
                        <th className="px-4 py-3">Tipo</th>
                        <th className="px-4 py-3 text-center">Operativo</th>
                        <th className="px-4 py-3">QR</th>
                        <th className="px-4 py-3 text-center">Admin</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F5F5] text-sm">
                      {datos.map((m) => (
                        <tr key={m.id} className="transition-colors hover:bg-[#F5F5F5]">
                          <td className="px-4 py-3.5 font-bold">{m.numero}</td>
                          <td className="px-4 py-3.5">{m.ambiente}</td>
                          <td className="px-4 py-3.5 text-center">{m.capacidad} pax</td>
                          <td className="px-4 py-3.5">
                            <span className="rounded bg-[#F5F5F5] px-2 py-0.5 text-xs font-semibold">
                              {m.tipo}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span
                              className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                              style={{ backgroundColor: `${m.color}22`, color: m.color }}
                            >
                              {m.estadoOperativo}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1.5 text-xs text-[#333333]/60">
                              <span className="material-symbols-outlined text-[18px] text-[#D4A017]">
                                qr_code_2
                              </span>
                              {m.qr ?? '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {m.estado === 'A' ? (
                              <span className="rounded bg-[#22C55E]/15 px-2 py-0.5 text-[11px] font-bold text-[#22C55E]">
                                Activa
                              </span>
                            ) : (
                              <span className="rounded bg-[#D9D9D9]/40 px-2 py-0.5 text-[11px] font-bold text-[#333333]/60">
                                Inactiva
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                title="Editar mesa"
                                onClick={() => abrirEditar(m)}
                                className="rounded-lg bg-[#2563EB]/10 px-2.5 py-1 text-xs font-semibold text-[#2563EB] transition-colors hover:bg-[#2563EB]/20"
                              >
                                Editar
                              </button>
                              <Toggle
                                activo={m.estado === 'A'}
                                titulo={m.estado === 'A' ? 'Desactivar' : 'Activar'}
                                onClick={() => void toggleEstado(m)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col items-center justify-between gap-3 bg-[#F5F5F5]/60 p-4 text-sm text-[#333333]/70 sm:flex-row">
                  <span>
                    Mostrando <strong>{datos.length}</strong> de <strong>{total}</strong> mesas
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="cursor-pointer rounded-lg bg-white px-3 py-1.5 shadow-sm transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white dark:bg-white/10 dark:hover:bg-white/20"
                    >
                      ← Anterior
                    </button>
                    <span>
                      Página {page} de {totalPaginas}
                    </span>
                    <button
                      disabled={page >= totalPaginas}
                      onClick={() => setPage((p) => p + 1)}
                      className="cursor-pointer rounded-lg bg-white px-3 py-1.5 shadow-sm transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white dark:bg-white/10 dark:hover:bg-white/20"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:hidden">
                {datos.map((m) => (
                  <article key={m.id} className="rounded-xl bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-[#7F1518]">{m.numero}</h3>
                        <p className="text-xs text-[#333333]/50">
                          {m.ambiente} · {m.capacidad} pax · {m.tipo}
                        </p>
                      </div>
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                        style={{ backgroundColor: `${m.color}22`, color: m.color }}
                      >
                        {m.estadoOperativo}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button
                        onClick={() => abrirEditar(m)}
                        className="cursor-pointer rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm font-semibold transition-colors hover:bg-[#D9D9D9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A61E22]/50"
                      >
                        Editar
                      </button>
                      <Toggle
                        activo={m.estado === 'A'}
                        titulo={m.estado === 'A' ? 'Desactivar' : 'Activar'}
                        onClick={() => void toggleEstado(m)}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {tab === 'ambientes' && (
        <section className="flex flex-col gap-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setFormAmb({ nombre: '', descripcion: '', piso: 1 });
                setModalAmb(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold shadow-sm transition-colors hover:bg-[#F5F5F5]"
            >
              <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
              <span>Nuevo Ambiente</span>
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {ambientes.map((a) => (
              <article key={a.id} className="flex h-56 flex-col justify-between rounded-xl bg-white p-5 shadow-sm">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider text-[#D4A017] uppercase">
                      {a.piso ? `Piso ${a.piso}` : 'Zona'}
                    </span>
                    {a.estado === 'A' ? (
                      <span className="rounded-full bg-[#22C55E]/15 px-2 py-0.5 text-[11px] font-semibold text-[#22C55E]">
                        Operativo
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#D9D9D9]/40 px-2 py-0.5 text-[11px] font-semibold text-[#333333]/60">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold">{a.nombre}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-[#333333]/60">{a.descripcion || '—'}</p>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div>
                    <div className="text-lg font-bold">{a.mesas} Mesas</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      title="QRs del ambiente"
                      onClick={() => setHojaQR(a)}
                      className="rounded-lg p-1.5 text-[#D4A017] transition-colors hover:bg-[#D4A017]/10"
                    >
                      <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                    </button>
                    <Toggle
                      activo={a.estado === 'A'}
                      titulo={a.estado === 'A' ? 'Desactivar ambiente' : 'Activar ambiente'}
                      onClick={() => void toggleAmbiente(a)}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#F5F5F5] px-6 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-[#7F1518]">{detalle.numero}</span>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                    style={{
                      backgroundColor: `${detalle.color}22`,
                      color: detalle.color,
                    }}
                  >
                    {detalle.estadoOperativo}
                  </span>
                </div>
                <span className="text-sm text-[#333333]/60">
                  {detalle.tipo} · {detalle.ambiente}
                </span>
              </div>
              <button
                onClick={() => setDetalle(null)}
                aria-label="Cerrar"
                className="rounded-lg p-2 transition-colors hover:bg-[#F5F5F5]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 px-6 pt-4">
              <div className="flex flex-col rounded-xl bg-[#F5F5F5] p-3">
                <span className="text-[11px] font-bold tracking-wider text-[#333333]/60 uppercase">
                  Comensales
                </span>
                <span className="mt-0.5 text-sm font-bold">
                  {detalle.ocupacion ? detalle.ocupacion.comensales : 0}/{detalle.capacidad}
                </span>
              </div>
              <div className="flex flex-col rounded-xl bg-[#F5F5F5] p-3">
                <span className="text-[11px] font-bold tracking-wider text-[#333333]/60 uppercase">
                  Mozo
                </span>
                <span className="mt-0.5 truncate text-sm font-bold" title={detalle.ocupacion?.mozo ?? ''}>
                  {detalle.ocupacion?.mozo ?? '—'}
                </span>
              </div>
              <div className="flex flex-col rounded-xl bg-[#F5F5F5] p-3">
                <span className="text-[11px] font-bold tracking-wider text-[#333333]/60 uppercase">
                  Consumo
                </span>
                <span className="mt-0.5 text-sm font-bold text-[#A61E22]">
                  S/. {(detalle.ocupacion?.total ?? 0).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-4 p-6">
              {detalle.ocupacion ? (
                <div className="rounded-xl bg-[#F5F5F5] p-4">
                  <div className="mb-2 flex items-center justify-between border-b border-[#D9D9D9] pb-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase">
                      <span className="material-symbols-outlined text-[18px] text-[#A61E22]">
                        receipt
                      </span>
                      Comanda {detalle.ocupacion.pedido}
                    </span>
                    <span className="text-xs text-[#333333]/60">
                      {detalle.ocupacion.items} ítems ({detalle.ocupacion.pendientes} en cocina)
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">
                    {detalle.ocupacion.platos.length > 0
                      ? detalle.ocupacion.platos.join(', ')
                      : 'Sin detalle de platos.'}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-[#D9D9D9] pt-2">
                    <span className="text-sm text-[#333333]/60">Subtotal consumo:</span>
                    <span className="text-lg font-bold text-[#A61E22]">
                      S/. {detalle.ocupacion.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="rounded-xl bg-[#F5F5F5] p-4 text-center text-sm text-[#333333]/60">
                  Sin comanda abierta.
                </p>
              )}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-[11px] font-bold tracking-wider text-[#333333]/60 uppercase">
                    Ambiente
                  </dt>
                  <dd className="font-medium">{detalle.ambiente}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold tracking-wider text-[#333333]/60 uppercase">
                    Capacidad
                  </dt>
                  <dd className="font-medium">{detalle.capacidad} pax</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold tracking-wider text-[#333333]/60 uppercase">
                    Tipo
                  </dt>
                  <dd className="font-medium">{detalle.tipo}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold tracking-wider text-[#333333]/60 uppercase">
                    Cargo servicio
                  </dt>
                  <dd className="font-medium">
                    {detalle.cargoServicio > 0
                      ? `S/. ${detalle.cargoServicio.toFixed(2)}`
                      : 'Sin cargo'}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-[11px] font-bold tracking-wider text-[#333333]/60 uppercase">
                    Detalle
                  </dt>
                  <dd className="font-medium">{detalle.detalle || '—'}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-[11px] font-bold tracking-wider text-[#333333]/60 uppercase">
                    Código QR
                  </dt>
                  <dd className="mt-1 flex flex-col items-center gap-3 rounded-xl bg-[#F5F5F5] p-4 text-center">
                    <div id="qr-print-detalle" className="flex flex-col items-center gap-1 bg-white p-2">
                      <QRCodeSVG value={qrValor(detalle.qr)} size={120} bgColor="#FFFFFF" fgColor="#000000" />
                      <strong className="text-sm">{detalle.numero}</strong>
                    </div>
                    {!detalle.qr && (
                      <span className="text-[11px] text-[#333333]/60">Sin QR en BD (provisional).</span>
                    )}
                    <div className="flex flex-wrap justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!descargarQRPng('qr-print-detalle', `QR-${detalle.numero}`)) {
                            setError('No se pudo generar el PNG del QR. Reintente.');
                          }
                        }}
                        className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#A61E22] shadow-sm transition-colors hover:bg-[#A61E22] hover:text-white"
                      >
                        Descargar PNG
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!imprimirContenedor('qr-print-detalle', `QR Mesa ${detalle.numero}`)) {
                            setError('El navegador bloqueó la ventana de impresión. Permita popups.');
                          }
                        }}
                        className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold shadow-sm transition-colors hover:bg-[#F5F5F5]"
                      >
                        Imprimir
                      </button>
                    </div>
                  </dd>
                </div>
              </dl>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    const d = detalle;
                    setDetalle(null);
                    if (d) {
                      abrirEditar(d);
                    }
                  }}
                  className="rounded-xl bg-[#2563EB]/10 px-5 py-2.5 text-sm font-semibold text-[#2563EB] transition-colors hover:bg-[#2563EB]/20"
                >
                  Editar
                </button>
                <button
                  onClick={() => setDetalle(null)}
                  className="rounded-xl bg-[#F5F5F5] px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[#D9D9D9]"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {hojaQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F5F5F5] px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-[#7F1518]">QRs · {hojaQR.nombre}</h2>
                <span className="text-sm text-[#333333]/60">
                  {porAmbiente(hojaQR.id).length} mesas · QR rotativo por mesa
                </span>
              </div>
              <button
                onClick={() => setHojaQR(null)}
                aria-label="Cerrar"
                className="rounded-lg p-2 transition-colors hover:bg-[#F5F5F5]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div id="hoja-qr-ambiente" className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3">
              {porAmbiente(hojaQR.id).map((m) => (
                <div
                  key={m.id}
                  className="item flex flex-col items-center gap-1 rounded-xl bg-[#F5F5F5] p-3"
                >
                  <div id={`qr-hoja-${m.id}`} className="flex flex-col items-center gap-1 bg-white p-2">
                    <QRCodeSVG value={qrValor(m.qr)} size={110} bgColor="#FFFFFF" fgColor="#000000" />
                    <strong className="text-sm">{m.numero}</strong>
                  </div>
                  <span className="text-[11px] text-[#333333]/60">{m.estadoOperativo}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!descargarQRPng(`qr-hoja-${m.id}`, `QR-${m.numero}`)) {
                        setError(`No se pudo descargar el QR de mesa ${m.numero}.`);
                      }
                    }}
                    className="rounded-lg bg-white px-3 py-1 text-[11px] font-bold text-[#A61E22] shadow-sm transition-colors hover:bg-[#A61E22] hover:text-white"
                  >
                    Descargar
                  </button>
                </div>
              ))}
              {porAmbiente(hojaQR.id).length === 0 && (
                <p className="col-span-full text-center text-sm text-[#333333]/60">
                  Sin mesas en este ambiente.
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-[#F5F5F5] px-6 py-4">
              <button
                onClick={() => {
                  if (!imprimirContenedor('hoja-qr-ambiente', `QRs ${hojaQR.nombre}`)) {
                    setError('El navegador bloqueó la impresión. Permita popups.');
                  }
                }}
                className="rounded-xl bg-[#A61E22] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7F1518]"
              >
                Imprimir hoja
              </button>
              <button
                onClick={() => setHojaQR(null)}
                className="rounded-xl bg-[#F5F5F5] px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[#D9D9D9]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 backdrop-blur-xs sm:p-4">
          <div className="flex max-h-screen w-full max-w-lg flex-col overflow-y-auto bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="text-xl font-bold text-[#7F1518]">
                {modal.editando ? `Editar Mesa ${modal.editando.numero}` : 'Nueva Mesa'}
              </h2>
              <button
                onClick={() => setModal(null)}
                aria-label="Cerrar"
                className="rounded-lg p-2 transition-colors hover:bg-[#F5F5F5]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-4 p-6">
              {formError && (
                <div role="alert" className="rounded-lg border border-[#DC2626]/30 bg-[#DC2626]/10 p-3 text-sm">
                  {formError}
                </div>
              )}
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Ambiente *</span>
                <select
                  value={form.ambienteId}
                  onChange={(e) => setForm({ ...form, ambienteId: Number(e.target.value) })}
                  className="rounded-lg bg-[#F5F5F5] px-3 py-2.5 text-sm outline-none"
                >
                  <option value={0}>Seleccione…</option>
                  {ambientes
                    .filter((a) => a.estado === 'A')
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre}
                      </option>
                    ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">
                    Número * (max 5)
                  </span>
                  <input
                    value={form.numero}
                    maxLength={5}
                    onChange={(e) => setForm({ ...form, numero: e.target.value.toUpperCase() })}
                    placeholder="Ej. M-15"
                    className="rounded-lg bg-[#F5F5F5] px-3 py-2.5 font-mono text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[#A61E22]"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Capacidad *</span>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={form.capacidad}
                    onChange={(e) => setForm({ ...form, capacidad: Number(e.target.value) })}
                    className="rounded-lg bg-[#F5F5F5] px-3 py-2.5 text-sm outline-none"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Tipo</span>
                <select
                  value={form.tipoId}
                  onChange={(e) => setForm({ ...form, tipoId: Number(e.target.value) })}
                  className="rounded-lg bg-[#F5F5F5] px-3 py-2.5 text-sm outline-none"
                >
                  {TIPOS_MESA.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Detalle</span>
                <textarea
                  value={form.detalle}
                  maxLength={100}
                  rows={2}
                  onChange={(e) => setForm({ ...form, detalle: e.target.value })}
                  placeholder="Ej. Cerca al ventanal"
                  className="resize-none rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm outline-none"
                />
              </label>
              <div className="rounded-lg bg-[#F5F5F5] p-3">
                <span className="flex items-center gap-1 text-[11px] font-bold tracking-wider text-[#D4A017] uppercase">
                  <span className="material-symbols-outlined text-[16px]">qr_code</span>
                  Código QR
                </span>
                {modal?.editando ? (
                  <div className="mt-2 flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, regenerarQr: false })}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${!form.regenerarQr ? 'bg-[#A61E22] text-white shadow-sm' : 'bg-white text-[#333333]/60 shadow-sm hover:bg-white'}`}
                      >
                        Mantener actual (no reimprimir)
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, regenerarQr: true })}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${form.regenerarQr ? 'bg-[#A61E22] text-white shadow-sm' : 'bg-white text-[#333333]/60 shadow-sm hover:bg-white'}`}
                      >
                        Regenerar por seguridad
                      </button>
                    </div>
                    {form.regenerarQr ? (
                      <p className="text-[11px] text-[#A61E22]">
                        Se generará un token nuevo para la misma mesa. El QR impreso anterior quedará invalidado: tendrás que reimprimir.
                      </p>
                    ) : cambioNumero ? (
                      <p className="text-[11px] text-[#D4A017]">
                        Ojo: cambiaste el número a {numeroNuevo}. Para guardar debes activar “Regenerar por seguridad” (el QR viejo quedará invalidado) o revertir el número.
                      </p>
                    ) : (
                      <p className="text-[11px] text-[#333333]/50">Se mantiene el QR actual.</p>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#333333]/50">Se genera solo al guardar.</p>
                )}
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setModal(null)}
                  className="rounded-xl bg-[#F5F5F5] px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[#D9D9D9]"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => void guardar()}
                  disabled={guardando}
                  className="rounded-xl bg-[#A61E22] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#7F1518] disabled:opacity-60"
                >
                  {guardando ? 'Guardando…' : 'Guardar Mesa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalAmb && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-[#7F1518]">Nuevo Ambiente</h2>
            <div className="mt-4 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Nombre *</span>
                <input
                  value={formAmb.nombre}
                  maxLength={50}
                  onChange={(e) => setFormAmb({ ...formAmb, nombre: e.target.value })}
                  placeholder="Ej. Terraza Norte"
                  className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[#A61E22]"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Descripción</span>
                <input
                  value={formAmb.descripcion}
                  maxLength={100}
                  onChange={(e) => setFormAmb({ ...formAmb, descripcion: e.target.value })}
                  className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Piso</span>
                <input
                  type="number"
                  min={0}
                  value={formAmb.piso}
                  onChange={(e) => setFormAmb({ ...formAmb, piso: Number(e.target.value) })}
                  className="rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none"
                />
              </label>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setModalAmb(false)}
                  className="cursor-pointer rounded-xl bg-[#F5F5F5] px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[#D9D9D9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A61E22]/50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => void guardarAmbiente()}
                  className="cursor-pointer rounded-xl bg-[#A61E22] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7F1518] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A61E22]/50 active:scale-[0.99]"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="h-8 animate-pulse rounded bg-[#F5F5F5]" />
      <div className="mt-3 h-8 animate-pulse rounded bg-[#F5F5F5]" />
      <div className="mt-3 h-8 animate-pulse rounded bg-[#F5F5F5]" />
    </div>
  );
}

function ErrorBox({ mensaje, reintentar }: { mensaje: string; reintentar: () => void }) {
  return (
    <div className="rounded-xl bg-white p-6 text-center shadow-sm">
      <p>{mensaje}</p>
      <button
        onClick={reintentar}
        className="mt-3 cursor-pointer rounded-lg bg-[#A61E22] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#7F1518] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A61E22]/50 active:scale-[0.99]"
      >
        Reintentar
      </button>
    </div>
  );
}

function Toggle({ activo, titulo, onClick }: { activo: boolean; titulo: string; onClick: () => void }) {
  return (
    <button
      title={titulo}
      onClick={onClick}
      className={`relative flex h-6 w-11 cursor-pointer items-center rounded-full p-0.5 transition-colors hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A61E22]/50 dark:hover:brightness-110 ${
        activo ? 'bg-[#A61E22]' : 'bg-[#D9D9D9]'
      }`}
    >
      <div
        className={`h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
          activo ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}
