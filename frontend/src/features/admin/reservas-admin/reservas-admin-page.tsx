import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Empty, Skeleton } from '../../../components/ui';
import type { Reserva, EstadoReserva } from './reservas-types';
import { ESTADO_RESERVA } from './reservas-types';
import {
  listarReservas,
  crearReserva,
  confirmarReserva,
  atenderReserva,
  listarMesasDisponibles,
  anularReserva,
  type MesaDisponible,
} from './reservas-service';
import { ESTADO_RESERVA as ER } from './reservas-types';
import { PageHeader } from '../../../components/ui';
import type { FiltrosReservas } from './reservas-service';
import { listarMesas } from '../mesas/mesas-service';
import { listarClientes } from '../clientes/clientes-service';
import type { Cliente } from '../clientes/clientes-types';

const LIMITE = 20;
const LIMITE_CLIENTES = 100;

const normalizarBusqueda = (valor: string) =>
  valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');

export function AdminReservasPage() {
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<'lista' | 'calendario'>('lista');
  const [filtros, setFiltros] = useState<FiltrosReservas>({ page: 1, limit: LIMITE, fecha: '', mesaId: '', estado: '' });
  const [datos, setDatos] = useState<Reserva[]>([]);
  const [mesas, setMesas] = useState<{ id: number; numero: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ fecha: '', hora: '', comensales: 1, observacion: '' });
  const [clienteBuscar, setClienteBuscar] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [clientesDisponibles, setClientesDisponibles] = useState<Cliente[]>([]);
  const [mostrarSugerenciasClientes, setMostrarSugerenciasClientes] = useState(false);
  const [buscandoClientes, setBuscandoClientes] = useState(false);
  const [errorBusquedaClientes, setErrorBusquedaClientes] = useState<string | null>(null);
  const [errorCrear, setErrorCrear] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [modalConfirmar, setModalConfirmar] = useState<{ id: number; mesaId?: number; observacion?: string } | null>(null);
  const [mesasDisponibles, setMesasDisponibles] = useState<MesaDisponible[]>([]);
  const [mesaConfirmar, setMesaConfirmar] = useState('');
  const [mesaBuscar, setMesaBuscar] = useState('');
  const [mostrarSugerenciasMesas, setMostrarSugerenciasMesas] = useState(false);
  const [observacionConfirmar, setObservacionConfirmar] = useState('');
  const [cargandoMesas, setCargandoMesas] = useState(false);
  const [guardandoConfirmacion, setGuardandoConfirmacion] = useState(false);
  const [errorConfirmar, setErrorConfirmar] = useState<string | null>(null);
  const [modalAnular, setModalAnular] = useState<{ id: number } | null>(null);
  const [modalAtender, setModalAtender] = useState<{ id: number } | null>(null);
  const [fCalendario, setFCalendario] = useState<Date>(new Date());

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await listarReservas(filtros);
      setDatos(res.data);
      setTotal(res.total);
    } catch {
      setError('No fue posible cargar las reservas.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { void cargar(); }, [filtros.fecha, filtros.mesaId, filtros.estado, filtros.page, tab]);
  useEffect(() => {
    void listarMesas({ page: 1, limit: 100, ambiente: '', estado: 'A', buscar: '' })
      .then((res) => setMesas(res.data.map(({ id, numero }) => ({ id, numero }))))
      .catch((e: unknown) => setError((e as Error).message || 'No se pudieron cargar las mesas.'));
  }, []);
  useEffect(() => {
    if (!modal) return;
    let vigente = true;
    const cargarClientes = async () => {
      setClientesDisponibles([]);
      setBuscandoClientes(true);
      setErrorBusquedaClientes(null);
      try {
        const primeraPagina = await listarClientes({
          page: 1,
          limit: LIMITE_CLIENTES,
          buscar: '',
          tipo: '',
          estado: 'A',
          orden: 'alpha',
        });
        const clientes = [...primeraPagina.data];
        const paginas = Math.ceil(primeraPagina.total / LIMITE_CLIENTES);

        for (let pagina = 2; pagina <= paginas; pagina += 1) {
          if (!vigente) return;
          const resultado = await listarClientes({
            page: pagina,
            limit: LIMITE_CLIENTES,
            buscar: '',
            tipo: '',
            estado: 'A',
            orden: 'alpha',
          });
          clientes.push(...resultado.data);
        }

        if (vigente) setClientesDisponibles(clientes);
      } catch (e: unknown) {
        if (vigente) {
          setErrorBusquedaClientes(e instanceof Error ? e.message : 'No se pudieron cargar los clientes.');
        }
      } finally {
        if (vigente) setBuscandoClientes(false);
      }
    };

    void cargarClientes();
    return () => {
      vigente = false;
    };
  }, [modal]);

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE));
  const totalDiasMes = new Date(fCalendario.getFullYear(), fCalendario.getMonth() + 1, 0).getDate();
  const busquedaClienteNormalizada = normalizarBusqueda(clienteBuscar.trim());
  const clientesCoincidentes = clientesDisponibles.filter((cliente) =>
    [cliente.nombre, cliente.documento, cliente.correo ?? '', cliente.telefono]
      .some((dato) => normalizarBusqueda(dato).includes(busquedaClienteNormalizada)),
  );
  const mesasCoincidentes = mesasDisponibles.filter((mesa) => {
    const buscar = mesaBuscar.trim().toLocaleLowerCase('es');
    const textoMesa = `Mesa ${mesa.numero} · ${mesa.capacidad} personas${mesa.ambiente ? ` · ${mesa.ambiente}` : ''}`.toLocaleLowerCase('es');
    return !buscar || textoMesa.includes(buscar);
  });

  const abrirNuevaReserva = () => {
    setForm({ fecha: '', hora: '', comensales: 1, observacion: '' });
    setClienteBuscar('');
    setClienteSeleccionado(null);
    setClientesDisponibles([]);
    setBuscandoClientes(true);
    setMostrarSugerenciasClientes(true);
    setErrorBusquedaClientes(null);
    setErrorCrear(null);
    setModal(true);
  };

  const setCalendarioAnterior = () => {
    setFCalendario(new Date(fCalendario.getFullYear(), fCalendario.getMonth() - 1, 1));
  };
  const setCalendarioSiguiente = () => {
    setFCalendario(new Date(fCalendario.getFullYear(), fCalendario.getMonth() + 1, 1));
  };

  const kpis = [
    { titulo: 'Hoy', numero: '0', tipo: 'default', subtitle: 'Reservas del día' },
    { titulo: 'Pendientes', numero: total > 0 ? String(datos.filter((r) => r.estado === 'P').length) : '0', tipo: 'warn', subtitle: 'Por confirmar' },
    { titulo: 'Confirmadas', numero: total > 0 ? String(datos.filter((r) => r.estado === 'C').length) : '0', tipo: 'ok', subtitle: 'Mesa asignada' },
    { titulo: 'Anuladas', numero: total > 0 ? String(datos.filter((r) => r.estado === 'X').length) : '0', tipo: 'bad', subtitle: 'Canceladas' },
  ];

  const colorEstado = (e: EstadoReserva) => ER[e] === 'Confirmada' ? 'bg-green-100 text-green-700' : ER[e] === 'Atendida' ? 'bg-blue-100 text-blue-700' : ER[e] === 'Cancelada' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700';

  const handleCrear = async () => {
    if (!clienteSeleccionado || !form.fecha || !form.hora || form.comensales < 1) {
      setErrorCrear('Selecciona un cliente de las sugerencias e ingresa fecha, hora y comensales válidos.');
      return;
    }
    setErrorCrear(null);
    setGuardando(true);
    try {
      await crearReserva({
        clienteId: clienteSeleccionado.id,
        fecha: form.fecha,
        hora: form.hora,
        comensales: form.comensales,
        observacion: form.observacion || undefined,
      });
      setModal(false);
      setForm({ fecha: '', hora: '', comensales: 1, observacion: '' });
      setClienteSeleccionado(null);
      await cargar();
    } catch (e: unknown) {
      setErrorCrear(e instanceof Error ? e.message : 'No se pudo crear la reserva.');
    } finally {
      setGuardando(false);
    }
  };

  const handleConfirmar = async (reserva: Reserva) => {
    setModalConfirmar({ id: reserva.id });
    setMesasDisponibles([]);
    setMesaConfirmar('');
    setMesaBuscar('');
    setMostrarSugerenciasMesas(false);
    setObservacionConfirmar(reserva.observacion ?? '');
    setErrorConfirmar(null);
    setCargandoMesas(true);
    try {
      const mesas = await listarMesasDisponibles(reserva.fecha, reserva.hora, reserva.comensales);
      setMesasDisponibles(mesas.filter((mesa) => mesa.disponible));
    } catch (e) {
      setErrorConfirmar((e as Error).message || 'No se pudieron cargar las mesas disponibles.');
    } finally {
      setCargandoMesas(false);
    }
  };

  const handleConfirmarGuardar = async () => {
    if (!modalConfirmar) return;
    if (!mesaConfirmar) {
      setErrorConfirmar('Selecciona una mesa de las sugerencias disponibles.');
      return;
    }
    setGuardandoConfirmacion(true);
    setErrorConfirmar(null);
    try {
      await confirmarReserva(modalConfirmar.id, {
        mesaId: Number(mesaConfirmar),
        observacion: observacionConfirmar.trim() || undefined,
      });
      setModalConfirmar(null);
      await cargar();
    } catch (e) {
      setErrorConfirmar((e as Error).message || 'No se pudo confirmar la reserva.');
    } finally {
      setGuardandoConfirmacion(false);
    }
  };

  const handleAnular = async (id: number) => {
    setModalAnular({ id });
  };

  const handleAnularEjecutar = async (id: number) => {
    try { await anularReserva(id); await cargar(); }
    catch { setError('No se pudo anular.'); }
    setModalAnular(null);
  };

  const handleAtender = async (id: number) => {
    setModalAtender({ id });
  };

  const handleAtenderEjecutar = async (id: number) => {
    try { await atenderReserva(id); await cargar(); }
    catch { setError('No se pudo atender.'); }
    setModalAtender(null);
  };

  return (
    <div className="y-shell" style={{ padding: '24px 16px 140px', maxWidth: 1240, margin: '0 auto' }}>
      <PageHeader
        title="Reservas"
        sub="Gestión operativa de mesas y clientes"
        right={
          <button
            onClick={abrirNuevaReserva}
            className="rounded-lg bg-[#A61E22] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7F1518]"
          >
            + Nueva Reserva
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-2">
        {kpis.map((k) => (
          <motion.div
            key={k.titulo}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 14 }}
            className="rounded-xl bg-white p-5 shadow-sm hover:bg-[#F5F5F5] transition-colors"
            style={{ minHeight: '80px' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#333333]/60 uppercase tracking-wider">{k.titulo}</span>
              <span className="text-[20px] font-bold text-[#7F1518]">{k.numero}</span>
            </div>
            <p className="mt-1 text-xs text-[#333333]/50">{k.subtitle}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => setTab('lista')}
          className={tab === 'lista' ? 'rounded-lg bg-[#A61E22] px-3 py-1.5 text-xs font-semibold text-white shadow-sm' : 'rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#333333]/60 shadow-sm hover:bg-[#F5F5F5]'}
        >
          Lista
        </button>
        <button
          onClick={() => setTab('calendario')}
          className={tab === 'calendario' ? 'rounded-lg bg-[#A61E22] px-3 py-1.5 text-xs font-semibold text-white shadow-sm' : 'rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#333333]/60 shadow-sm hover:bg-[#F5F5F5]'}
        >
          Calendario
        </button>
      </div>

      <div className="mt-6 rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#F5F5F5]">
          <h2 className="font-d text-xl font-medium text-[#7F1518]" style={{ margin: 0 }}>
            {total > 0 ? 'Reservas' : 'No hay reservas registradas'}
          </h2>
          <div className="flex gap-2">
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value as '' | EstadoReserva, page: 1 })}
              className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm outline-none"
            >
              <option value="">Todos los estados</option>
              {(Object.keys(ESTADO_RESERVA) as ('P' | 'C' | 'A' | 'X')[]).map((k) => (
                <option key={k} value={k}>{ESTADO_RESERVA[k]}</option>
              ))}
            </select>
            <select
              value={filtros.mesaId}
              onChange={(e) => setFiltros({ ...filtros, mesaId: e.target.value === '' ? '' : Number(e.target.value), page: 1 })}
              className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm outline-none"
            >
              <option value="">Todas las mesas</option>
              {mesas.map((mesa) => <option key={mesa.id} value={mesa.id}>Mesa {mesa.numero}</option>)}
            </select>
            <input
              type="date"
              value={filtros.fecha}
              onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value, page: 1 })}
              className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm outline-none"
            />
          </div>
        </div>

        <div className="p-4">{error && <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700">{error} <button onClick={() => setError(null)} className="ml-2 underline">Cerrar</button></div>}</div>

        {cargando ? (
          <Skeleton className="h-64" />
        ) : total === 0 ? (
          <Empty
            title="Sin reservas registradas"
            sub="Reservas pendientes, confirmadas o canceladas"
          />
        ) : tab === 'lista' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F5F5F5] text-left text-xs uppercase tracking-wider text-[#333333]/60">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Cliente</th>
                  <th className="px-3 py-2">Mesa</th>
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Hora</th>
                  <th className="px-3 py-2">Comensales</th>
                  <th className="px-3 py-2">Observación</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F5]">
                {datos.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F5F5F5]">
                    <td className="px-3 py-2">{r.id}</td>
                    <td className="px-3 py-2">{r.cliente}</td>
                    <td className="px-3 py-2">{r.mesa || '—'}</td>
                    <td className="px-3 py-2">{r.fecha}</td>
                    <td className="px-3 py-2">{r.hora}</td>
                    <td className="px-3 py-2">{r.comensales}</td>
                    <td className="max-w-48 px-3 py-2 text-[#333333]/70">{r.observacion || '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${colorEstado(r.estado)}`}>
                        {ESTADO_RESERVA[r.estado]}
                      </span>
                    </td>
                    <td className="px-3 py-2 flex gap-1">
                      {r.estado === 'P' && (
                        <button
                          onClick={() => void handleConfirmar(r)}
                          className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-700 hover:bg-yellow-200"
                        >
                          Confirmar
                        </button>
                      )}
                      {r.estado === 'C' && (
                        <div className="flex gap-1">
                          <span className="rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                            Mesa {r.mesa ?? '—'} asignada
                          </span>
                          <button
                            onClick={() => handleAtender(r.id)}
                            className="rounded bg-green-100 px-2 py-1 text-xs text-green-700 hover:bg-green-200"
                          >
                            Atender
                          </button>
                        </div>
                      )}
                      {r.estado === 'C' && (
                        <button
                          onClick={() => handleAnular(r.id)}
                          className="rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200"
                        >
                          Anular
                        </button>
                      )}
                      {r.estado === 'A' && (
                        <button
                          onClick={() => handleAnular(r.id)}
                          className="rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200"
                        >
                          Anular
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : tab === 'calendario' ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-d text-xl font-medium text-[#7F1518]">Calendario de Reservas</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setCalendarioAnterior()}
                  className="rounded-lg bg-[#F5F5F5] px-3 py-1.5 text-sm font-semibold hover:bg-[#D9D9D9]"
                >
                  ←
                </button>
                <span className="text-sm text-[#333333]/60">
                  {fCalendario.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => setCalendarioSiguiente()}
                  className="rounded-lg bg-[#F5F5F5] px-3 py-1.5 text-sm font-semibold hover:bg-[#D9D9D9]"
                >
                  →
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: totalDiasMes }).map((_, i) => {
                const dia = i + 1;
                const reservasDia = datos.filter((r) => {
                  const rFecha = new Date(r.fecha);
                  return rFecha.getDate() === dia && rFecha.getMonth() === fCalendario.getMonth();
                });
                return (
                  <div
                    key={dia}
                    className="rounded-xl bg-white p-3 shadow-sm hover:bg-[#F5F5F5] cursor-pointer transition-colors"
                    onClick={() => setFiltros({ ...filtros, fecha: `${fCalendario.getFullYear()}-${String(fCalendario.getMonth() + 1).padStart(2, '0')}-${String(fCalendario.getDate()).padStart(2, '0')}`, page: 1 })}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#7F1518]">{dia}</span>
                      <span className="text-xs text-[#333333]/60">{reservasDia.length} res.</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>Ver datos</div>
        )}

        <div className="flex items-center justify-between p-4 bg-[#F5F5F5]/60">
          <span className="text-sm">Página {page} de {totalPaginas}</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((x) => Math.max(1, x - 1))}
              className="rounded-lg bg-white px-3 py-1.5 shadow-sm transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← Anterior
            </button>
            <button
              disabled={page >= totalPaginas}
              onClick={() => setPage((x) => x + 1)}
              className="rounded-lg bg-white px-3 py-1.5 shadow-sm transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#F5F5F5] px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-[#7F1518]">Nueva Reserva</h2>
              </div>
              <button
                onClick={() => setModal(false)}
                aria-label="Cerrar"
                className="rounded-lg p-2 transition-colors hover:bg-[#D9D9D9]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={(event) => { event.preventDefault(); void handleCrear(); }} className="flex flex-col gap-4 p-6">
              <div>
                <label htmlFor="cliente-reserva-buscar" className="mb-1 block text-xs font-bold uppercase opacity-60">
                  Cliente *
                </label>
                <div className="relative">
                  <input
                    id="cliente-reserva-buscar"
                    type="text"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={mostrarSugerenciasClientes}
                    aria-controls="clientes-reserva-sugerencias"
                    autoComplete="off"
                    value={clienteBuscar}
                    onFocus={() => setMostrarSugerenciasClientes(true)}
                    onChange={(event) => {
                      setClienteBuscar(event.target.value);
                      setClienteSeleccionado(null);
                      setMostrarSugerenciasClientes(true);
                      setErrorBusquedaClientes(null);
                      setErrorCrear(null);
                    }}
                    placeholder="Buscar por nombre, documento, correo o teléfono"
                    className="w-full rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm"
                  />
                  {mostrarSugerenciasClientes && (
                    <div
                      id="clientes-reserva-sugerencias"
                      role="listbox"
                      className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-[#E8E1DB] bg-white shadow-lg"
                    >
                      {buscandoClientes && (
                        <p className="px-3 py-2 text-sm text-gray-500">Cargando clientes…</p>
                      )}
                      {!buscandoClientes && !errorBusquedaClientes && clientesCoincidentes.length === 0 && (
                        <p className="px-3 py-2 text-sm text-gray-500">
                          {clienteBuscar.trim() ? 'No se encontraron coincidencias.' : 'No hay clientes activos.'}
                        </p>
                      )}
                      {clientesCoincidentes.map((cliente) => (
                        <button
                          key={cliente.id}
                          type="button"
                          role="option"
                          aria-selected={clienteSeleccionado?.id === cliente.id}
                          onClick={() => {
                            setClienteSeleccionado(cliente);
                            setClienteBuscar(cliente.nombre);
                            setMostrarSugerenciasClientes(false);
                            setErrorBusquedaClientes(null);
                            setErrorCrear(null);
                          }}
                          className="flex w-full flex-col items-start border-b border-[#F0EBE7] px-3 py-2 text-left last:border-0 hover:bg-[#FAF6F2]"
                        >
                          <span className="text-sm font-semibold text-[#333333]">{cliente.nombre}</span>
                          <span className="text-xs text-[#333333]/65">
                            {cliente.tipoDoc} {cliente.documento}
                            {cliente.correo ? ` · ${cliente.correo}` : cliente.telefono ? ` · ${cliente.telefono}` : ''}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {clienteSeleccionado && (
                  <p className="mt-1 text-xs text-green-700">
                    Seleccionado: {clienteSeleccionado.tipoDoc} {clienteSeleccionado.documento}
                  </p>
                )}
                {errorBusquedaClientes && (
                  <p role="alert" className="mt-1 text-sm text-red-700">{errorBusquedaClientes}</p>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase opacity-60">Fecha *</span>
                    <input
                      type="date"
                      required
                      value={form.fecha}
                      onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                      className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm"
                    />
                  </label>
                </div>
                <div>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase opacity-60">Hora *</span>
                    <input
                      type="time"
                      required
                      value={form.hora}
                      onChange={(e) => setForm({ ...form, hora: e.target.value })}
                      className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm"
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase opacity-60">Comensales</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={form.comensales}
                    onChange={(e) => setForm({ ...form, comensales: Number(e.target.value) }) }
                    className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm"
                  />
                </label>
                <div>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase opacity-60">Observación</span>
                    <textarea
                      value={form.observacion || ''}
                      onChange={(e) => setForm({ ...form, observacion: e.target.value }) }
                      className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm resize-none"
                      rows={3}
                      placeholder="Cumpleaños, mesa cerca a la ventana..."
                    />
                  </label>
                </div>
              </div>
              {errorCrear && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errorCrear}
                </p>
              )}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="rounded-xl bg-[#F5F5F5] px-5 py-2.5 text-sm font-semibold hover:bg-[#D9D9D9]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="rounded-xl bg-[#A61E22] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#7F1518] disabled:opacity-60"
                >
                  {guardando ? 'Guardando…' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalConfirmar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between bg-gradient-to-r from-[#7F1518] to-[#A61E22] px-6 py-5 text-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Aprobación de reserva</p>
                <h2 className="mt-1 text-2xl font-bold">Reserva #{modalConfirmar.id}</h2>
              </div>
              <button
                type="button"
                onClick={() => setModalConfirmar(null)}
                aria-label="Cerrar"
                className="rounded-full p-2 transition-colors hover:bg-white/15"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form
              onSubmit={(event) => { event.preventDefault(); void handleConfirmarGuardar(); }}
              className="space-y-5 p-6"
            >
              <div className="rounded-2xl bg-[#FAF6F2] p-4">
                <p className="text-sm font-semibold text-[#7F1518]">Asigna una mesa disponible</p>
                <p className="mt-1 text-xs text-[#333333]/65">
                  Las opciones consideran el horario y la cantidad de comensales de la reserva.
                </p>
              </div>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#333333]/60">Mesa disponible *</span>
                <div className="relative">
                  <input
                    id="mesaConfirmar"
                    type="text"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={mostrarSugerenciasMesas}
                    aria-controls="mesas-disponibles-sugerencias"
                    autoComplete="off"
                    value={mesaBuscar}
                    onFocus={() => setMostrarSugerenciasMesas(true)}
                    onChange={(event) => {
                      setMesaBuscar(event.target.value);
                      setMesaConfirmar('');
                      setMostrarSugerenciasMesas(true);
                      setErrorConfirmar(null);
                    }}
                    disabled={cargandoMesas || mesasDisponibles.length === 0}
                    placeholder={cargandoMesas ? 'Buscando mesas disponibles…' : 'Buscar por número, capacidad o ambiente'}
                    className="w-full rounded-xl border border-[#E8E1DB] bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[#A61E22] focus:ring-2 focus:ring-[#A61E22]/15 disabled:bg-[#F5F5F5]"
                  />
                  {mostrarSugerenciasMesas && mesasDisponibles.length > 0 && (
                    <div
                      id="mesas-disponibles-sugerencias"
                      role="listbox"
                      className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-[#E8E1DB] bg-white shadow-lg"
                    >
                      {mesasCoincidentes.length > 0 ? mesasCoincidentes.map((mesa) => (
                        <button
                          key={mesa.mesaId}
                          type="button"
                          role="option"
                          aria-selected={mesaConfirmar === String(mesa.mesaId)}
                          onClick={() => {
                            setMesaConfirmar(String(mesa.mesaId));
                            setMesaBuscar(`Mesa ${mesa.numero} · ${mesa.capacidad} personas${mesa.ambiente ? ` · ${mesa.ambiente}` : ''}`);
                            setMostrarSugerenciasMesas(false);
                            setErrorConfirmar(null);
                          }}
                          className="w-full border-b border-[#F0EBE7] px-4 py-3 text-left text-sm last:border-0 hover:bg-[#FAF6F2]"
                        >
                          Mesa {mesa.numero} · {mesa.capacidad} personas{mesa.ambiente ? ` · ${mesa.ambiente}` : ''}
                        </button>
                      )) : (
                        <p className="px-4 py-3 text-sm text-gray-500">No hay mesas que coincidan con la búsqueda.</p>
                      )}
                    </div>
                  )}
                </div>
                {mesasDisponibles.length === 0 && !cargandoMesas && !errorConfirmar && (
                  <span className="mt-2 block text-sm text-amber-700">No hay mesas disponibles para esta fecha, hora y grupo.</span>
                )}
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#333333]/60">Observación</span>
                <textarea
                  value={observacionConfirmar}
                  onChange={(event) => setObservacionConfirmar(event.target.value)}
                  maxLength={200}
                  className="min-h-24 resize-y rounded-xl border border-[#E8E1DB] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#A61E22] focus:ring-2 focus:ring-[#A61E22]/15"
                  placeholder="Indicaciones para el equipo o el cliente..."
                />
                <span className="text-right text-xs text-[#333333]/45">{observacionConfirmar.length}/200</span>
              </label>
              {errorConfirmar && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorConfirmar}
                </p>
              )}
              <div className="flex justify-end gap-3 border-t border-[#F0EBE7] pt-4">
                <button
                  type="button"
                  onClick={() => setModalConfirmar(null)}
                  className="rounded-xl border border-[#E8E1DB] px-5 py-2.5 text-sm font-semibold text-[#514A45] transition hover:bg-[#FAF6F2]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!mesaConfirmar || cargandoMesas || guardandoConfirmacion}
                  className="rounded-xl bg-[#A61E22] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7F1518] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {guardandoConfirmacion ? 'Confirmando…' : 'Confirmar reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalAnular && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-[#7F1518]">Anular Reserva #{modalAnular.id}</h2>
            <p className="mt-2 text-sm opacity-70">¿Estás seguro de anular esta reserva?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setModalAnular(null)}
                className="rounded-xl bg-[#F5F5F5] px-5 py-2.5 text-sm font-semibold hover:bg-[#D9D9D9]"
              >
                Cancelar
              </button>
              <button
                onClick={() => void handleAnularEjecutar(modalAnular.id)}
                className="rounded-xl bg-[#A61E22] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7F1518]"
              >
                Anular
              </button>
            </div>
          </div>
        </div>
      )}

      {modalAtender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-[#7F1518]">Atender Reserva #{modalAtender.id}</h2>
            <p className="mt-2 text-sm opacity-70">¿Marcar esta reserva como Atendida (cliente llegó a la mesa)?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setModalAtender(null)}
                className="rounded-xl bg-[#F5F5F5] px-5 py-2.5 text-sm font-semibold hover:bg-[#D9D9D9]"
              >
                Cancelar
              </button>
              <button
                onClick={() => void handleAtenderEjecutar(modalAtender.id)}
                className="rounded-xl bg-[#A61E22] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7F1518]"
              >
                Atender
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}