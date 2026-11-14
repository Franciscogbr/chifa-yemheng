import { useEffect, useState, type CSSProperties } from 'react';
import { leerToken } from '../../auth/login/auth-service';
import { exportarReportesExcel, exportarReportesPdf, type ReporteExportable } from './reportes-export';
import { TablaReporte } from '@/shared/ui/TablaReporte';

import { API_URL } from '../../../lib/api-url';

const BASE = `${API_URL}/reportes`;

type ReportTab =
  | 'ventas'
  | 'productos'
  | 'categorias'
  | 'arqueo'
  | 'pagos'
  | 'comprobantes'
  | 'movimientos'
  | 'reservas'
  | 'delivery'
  | 'canales'
  | 'horarios'
  | 'ticket'
  | 'anulaciones'
  | 'notas-credito'
  | 'clientes'
  | 'mesas'
  | 'empleados'
  | 'fiscal'
  | 'ventas-anuladas'
  | 'sunat'
  | 'pagos-operacion'
  | 'reservas-estado'
  | 'tipo-cliente'
  | 'comparacion'
  | 'caja-resumen';

const CATEGORIAS: Record<
  string,
  { label: string; tabs: ReportTab[] }
> = {
  ventas: {
    label: 'Ventas y facturación',
    tabs: ['ventas', 'comprobantes', 'ventas-anuladas', 'notas-credito', 'fiscal', 'comparacion'],
  },
  productos: {
    label: 'Productos y catálogo',
    tabs: ['productos', 'categorias', 'clientes', 'tipo-cliente'],
  },
  caja: {
    label: 'Caja y pagos',
    tabs: ['arqueo', 'pagos', 'pagos-operacion', 'movimientos', 'caja-resumen'],
  },
  delivery: {
    label: 'Clientes y delivery',
    tabs: ['reservas', 'delivery'],
  },
  analisis: {
    label: 'Análisis comercial',
    tabs: ['canales', 'horarios', 'ticket', 'mesas', 'empleados'],
  },
  fiscal: {
    label: 'Fiscal y estado',
    tabs: ['sunat', 'reservas-estado'],
  },
};

const TAB_LABEL: Record<ReportTab, string> = {
  ventas: 'Ventas',
  productos: 'Productos más vendidos',
  categorias: 'Ventas por categoría',
  arqueo: 'Arqueos de caja',
  pagos: 'Pagos por medio',
  comprobantes: 'Comprobantes',
  movimientos: 'Movimientos',
  reservas: 'Reservas',
  delivery: 'Delivery',
  canales: 'Canales y pedidos',
  horarios: 'Días y horarios',
  ticket: 'Ticket promedio',
  anulaciones: 'Pedidos anulados',
  'notas-credito': 'Notas de crédito',
  clientes: 'Clientes frecuentes',
  mesas: 'Ventas por mesa',
  empleados: 'Ventas por empleado',
  fiscal: 'Desglose fiscal',
  'ventas-anuladas': 'Ventas anuladas',
  sunat: 'SUNAT registrado',
  'pagos-operacion': 'Pagos por operación',
  'reservas-estado': 'Reservas por estado',
  'tipo-cliente': 'Tipo de cliente',
  comparacion: 'Comparación de periodos',
  'caja-resumen': 'Resumen de caja',
};

const CLASES_CATEGORIA: Record<string, { bg: string; text: string; border: string }> = {
  ventas: { bg: 'bg-[#A61E22]', text: 'text-[#A61E22]', border: 'border-[#A61E22]' },
  caja: { bg: 'bg-[#1D4ED8]', text: 'text-[#1D4ED8]', border: 'border-[#1D4ED8]' },
  productos: { bg: 'bg-[#059669]', text: 'text-[#059669]', border: 'border-[#059669]' },
  delivery: { bg: 'bg-[#B45309]', text: 'text-[#B45309]', border: 'border-[#B45309]' },
  analisis: { bg: 'bg-[#7C3AED]', text: 'text-[#7C3AED]', border: 'border-[#7C3AED]' },
  fiscal: { bg: 'bg-[#DC2626]', text: 'text-[#DC2626]', border: 'border-[#DC2626]' },
};

const filterLabel: CSSProperties = {
  display: 'grid',
  gap: 5,
  color: 'var(--text-muted)',
  fontSize: 12,
};

interface VentaDiaria { fecha: string; tipodocumento: string; comprobantes: number; subtotal: number; igv: number; total: number; }
interface ProductoMasVendido { productoId: number; producto: string; categoria: string; cantidad: number; total: number; }
interface ArqueoCaja { turnoId: number; caja: string; numeroTurno: number; fechaApertura: string; fechaCierre: string | null; usuarioApertura: string; usuarioCierre: string | null; montoInicial: number; totalIngresos: number; totalEgresos: number; montoSistema: number; montoDeclarado: number; diferencia: number; situacion: string; }
interface PagoMedio { fecha: string; metodoPagoId: number; metodoPago: string; usuarioId: number; usuario: string; comprobantes: number; operaciones: number; total: number; efectivoFisico: boolean; }
interface Comprobante { ventaId: number; fecha: string; tipoDocumento: string; serie: string; numero: string; caja: string; turno: string; usuario: string; usuarioId: number; total: number; }
interface MovimientoCaja { id: number; fecha: string; caja: string; turno: string; tipoMovimiento: string; concepto: string; metodoPago: string; monto: number; afectaEfectivo: boolean; descripcion: string | null; referencia: string | null; banco: string | null; usuario: string; usuarioId: number; }
interface VentaCategoria { categoriaId: number | null; categoria: string; cantidadProductos: number; unidades: number; total: number; }
interface ReservaReporte { id: number; cliente: string; mesa: string; responsable: string; fecha: string; personas: number; adelanto: number; estado: string; observacion: string | null; }
interface DeliveryReporte { id: number; pedido: string; distritoId: number | null; distrito: string; repartidorId: number | null; repartidor: string; estado: string; costoEnvio: number; fechaCreacion: string; fechaSalida: string | null; fechaEntrega: string | null; }
interface AnalisisComercial {
  ventasCanal: { canal: string; tipoPedido: string; comprobantes: number; total: number }[];
  ventasHorario: { diaSemana: string; hora: string; comprobantes: number; total: number }[];
  ticketPromedio: { fecha: string; comprobantes: number; total: number; comensales: number; ticketPromedio: number; ticketPorComensal: number | null }[];
  pedidosAnulados: { id: number; numero: string; fechaPedido: string; tipo: string; responsable: string; total: number; comensales: number; motivo: string | null }[];
  notasCredito: { id: number; ventaId: number; serie: string; numero: string; tipoDocumentoReferencia: string; serieReferencia: string; numeroReferencia: string; motivo: string; monto: number; fecha: string; estadoSunat: string | null }[];
  clientesFrecuentes: { clienteId: number; compras: number; total: number; ultimaCompra: string; nombre: string; ticketPromedio: number }[];
  ventasPorMesa: { mesa: string; ambiente: string; comprobantes: number; total: number }[];
  ventasPorEmpleado: { empleado: string; comprobantes: number; total: number }[];
  desgloseFiscal: { fecha: string; comprobantes: number; subtotal: number; descuento: number; servicio: number; igv: number; total: number }[];
  ventasAnuladas: { id: number; fechaVenta: string; tipoDocumento: string; total: number; motivo: string | null; responsable: string }[];
  estadoSunat: { ventaId: number; tipoDocumento: string; serie: string; numero: string; fecha: string; total: number; estadoRegistrado: string }[];
  pagosPorOperacion: { id: number; ventaId: number; fechaPago: string; fechaVenta: string; tipoDocumento: string; aperturaId: number | null; metodoPago: string; monto: number; referencia: string | null }[];
  reservasPorEstado: { estado: string; cantidad: number }[];
  ventasPorTipoCliente: { tipo: string; comprobantes: number; total: number }[];
  comparacionPeriodos: { desde: string; hasta: string; anteriorDesde: string; anteriorHasta: string; ventasActuales: number; ventasAnteriores: number; diferencia: number; variacionPorcentual: number | null } | null;
  resumenCaja: { aperturaId: number; caja: string; turno: string; fechaApertura: string; fechaCierre: string | null; situacion: string; ventasRegistradas: number; ingresosTurno: number; egresosTurno: number; montoSistema: number; montoDeclarado: number; diferencia: number }[];
}

function opcionesUnicas(valores: string[]): string[] {
  return Array.from(new Set(valores.filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'));
}

function cumpleRango(valor: number, minimo: string, maximo: string): boolean {
  const desde = minimo === '' ? null : Number(minimo);
  const hasta = maximo === '' ? null : Number(maximo);
  return (desde === null || valor >= desde) && (hasta === null || valor <= hasta);
}

function etiquetaEstadoReserva(estado: string): string {
  return estado === 'P' ? 'Pendiente'
    : estado === 'C' ? 'Confirmada'
      : estado === 'A' ? 'Atendida'
        : estado === 'X' ? 'Anulada'
          : estado;
}

function tipoDocumento(tipo: string) { return tipo === '03' ? 'Boleta' : tipo === '01' ? 'Factura' : tipo; }
function formatoFecha(fecha: string | null) { return fecha ? new Date(fecha).toLocaleString('es-PE') : '—'; }
const fmt = (n: number) => `S/. ${n.toFixed(2)}`;

async function fetchReporte<T>(path: string, params: Record<string, string>): Promise<T> {
  const q = new URLSearchParams(params);
  const res = await fetch(`${BASE}/${path}?${q.toString()}`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${leerToken() ?? ''}` },
  });
  if (!res.ok) throw new Error('NETWORK_ERROR');
  return res.json();
}

export function AdminReportesPage() {
  const [categoria, setCategoria] = useState<string>('ventas');
  const [tab, setTab] = useState<ReportTab>('ventas');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [tipoDocumentoFiltro, setTipoDocumentoFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [cajaFiltro, setCajaFiltro] = useState('');
  const [estadoTurnoFiltro, setEstadoTurnoFiltro] = useState('');
  const [estadoSunatFiltro, setEstadoSunatFiltro] = useState('');
  const [responsableFiltro, setResponsableFiltro] = useState('');
  const [medioPagoFiltro, setMedioPagoFiltro] = useState('');
  const [tipoMovimientoFiltro, setTipoMovimientoFiltro] = useState('');
  const [afectaEfectivoFiltro, setAfectaEfectivoFiltro] = useState('');
  const [estadoReservaFiltro, setEstadoReservaFiltro] = useState('');
  const [personasDesde, setPersonasDesde] = useState('');
  const [personasHasta, setPersonasHasta] = useState('');
  const [estadoDeliveryFiltro, setEstadoDeliveryFiltro] = useState('');
  const [distritoDeliveryFiltro, setDistritoDeliveryFiltro] = useState('');
  const [repartidorDeliveryFiltro, setRepartidorDeliveryFiltro] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [montoDesde, setMontoDesde] = useState('');
  const [montoHasta, setMontoHasta] = useState('');
  const [limiteProductos, setLimiteProductos] = useState('50');

  const [ventas, setVentas] = useState<VentaDiaria[]>([]);
  const [productos, setProductos] = useState<ProductoMasVendido[]>([]);
  const [arqueo, setArqueo] = useState<ArqueoCaja[]>([]);
  const [pagos, setPagos] = useState<PagoMedio[]>([]);
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([]);
  const [ventasCategoria, setVentasCategoria] = useState<VentaCategoria[]>([]);
  const [reservas, setReservas] = useState<ReservaReporte[]>([]);
  const [delivery, setDelivery] = useState<DeliveryReporte[]>([]);
  const [analisisComercial, setAnalisisComercial] = useState<AnalisisComercial>({
    ventasCanal: [],
    ventasHorario: [],
    ticketPromedio: [],
    pedidosAnulados: [],
    notasCredito: [],
    clientesFrecuentes: [],
    ventasPorMesa: [],
    ventasPorEmpleado: [],
    desgloseFiscal: [],
    ventasAnuladas: [],
    estadoSunat: [],
    pagosPorOperacion: [],
    reservasPorEstado: [],
    ventasPorTipoCliente: [],
    comparacionPeriodos: null,
    resumenCaja: [],
  });
  const [cargando, setCargando] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (desde) params.desde = desde;
      if (hasta) params.hasta = hasta;
      const [v, p, a, pay, comp, mov, cat, res, del, analisis] = await Promise.all([
        fetchReporte<VentaDiaria[]>('ventas-diarias', params),
        fetchReporte<ProductoMasVendido[]>('productos-mas-vendidos', { limit: '1000', ...params }),
        fetchReporte<ArqueoCaja[]>('arqueo-caja', params),
        fetchReporte<PagoMedio[]>('pagos-por-medio', params),
        fetchReporte<Comprobante[]>('comprobantes', params),
        fetchReporte<MovimientoCaja[]>('movimientos-caja', params),
        fetchReporte<VentaCategoria[]>('ventas-por-categoria', params),
        fetchReporte<ReservaReporte[]>('reservas', params),
        fetchReporte<DeliveryReporte[]>('delivery', params),
        fetchReporte<AnalisisComercial>('analisis-comercial', params),
      ]);
      setVentas(v);
      setProductos(p);
      setArqueo(a);
      setPagos(pay);
      setComprobantes(comp);
      setMovimientos(mov);
      setVentasCategoria(cat);
      setReservas(res);
      setDelivery(del);
      setAnalisisComercial(analisis);
    } catch {
      setError('No fue posible cargar los reportes.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { void cargar(); }, [desde, hasta]);

  const periodo = desde || hasta
    ? `${desde || 'inicio'} / ${hasta || 'hoy'}`
    : 'Histórico completo';
  const termino = busqueda.trim().toLocaleLowerCase('es');

  const ventasFiltradas = ventas.filter((row) =>
    (!tipoDocumentoFiltro || row.tipodocumento === tipoDocumentoFiltro)
    && cumpleRango(row.total, montoDesde, montoHasta));
  const productosFiltrados = productos
    .filter((row) =>
      (!categoriaFiltro || row.categoria === categoriaFiltro)
      && (!termino || `${row.producto} ${row.categoria}`.toLocaleLowerCase('es').includes(termino))
      && cumpleRango(row.total, montoDesde, montoHasta))
    .slice(0, Number(limiteProductos));
  const arqueoFiltrado = arqueo.filter((row) =>
    (!cajaFiltro || row.caja === cajaFiltro)
    && (!estadoTurnoFiltro || row.situacion === estadoTurnoFiltro)
    && (!responsableFiltro || row.usuarioApertura === responsableFiltro)
    && cumpleRango(row.montoSistema, montoDesde, montoHasta));
  const pagosFiltrados = pagos.filter((row) =>
    (!medioPagoFiltro || row.metodoPago === medioPagoFiltro)
    && (!responsableFiltro || row.usuario === responsableFiltro)
    && (!afectaEfectivoFiltro || String(row.efectivoFisico) === afectaEfectivoFiltro)
    && cumpleRango(row.total, montoDesde, montoHasta));
  const comprobantesFiltrados = comprobantes.filter((row) =>
    (!cajaFiltro || row.caja === cajaFiltro)
    && (!responsableFiltro || row.usuario === responsableFiltro)
    && (!tipoDocumentoFiltro || row.tipoDocumento === tipoDocumentoFiltro)
    && (!termino || `${row.serie} ${row.numero} ${row.usuario} ${row.caja}`.toLocaleLowerCase('es').includes(termino))
    && cumpleRango(row.total, montoDesde, montoHasta));
  const movimientosFiltrados = movimientos.filter((row) =>
    (!cajaFiltro || row.caja === cajaFiltro)
    && (!responsableFiltro || row.usuario === responsableFiltro)
    && (!medioPagoFiltro || row.metodoPago === medioPagoFiltro)
    && (!tipoMovimientoFiltro || row.tipoMovimiento === tipoMovimientoFiltro)
    && (!afectaEfectivoFiltro || String(row.afectaEfectivo) === afectaEfectivoFiltro)
    && (!termino || `${row.concepto} ${row.descripcion ?? ''} ${row.referencia ?? ''} ${row.banco ?? ''}`.toLocaleLowerCase('es').includes(termino))
    && cumpleRango(row.monto, montoDesde, montoHasta));
  const ventasCategoriaFiltradas = ventasCategoria.filter((row) =>
    (!termino || row.categoria.toLocaleLowerCase('es').includes(termino))
    && cumpleRango(row.total, montoDesde, montoHasta));
  const reservasFiltradas = reservas.filter((row) =>
    (!estadoReservaFiltro || row.estado === estadoReservaFiltro)
    && cumpleRango(row.personas, personasDesde, personasHasta)
    && cumpleRango(row.adelanto, montoDesde, montoHasta)
    && (!termino || `${row.cliente} ${row.mesa} ${row.responsable} ${row.observacion ?? ''}`.toLocaleLowerCase('es').includes(termino)));
  const deliveryFiltrado = delivery.filter((row) =>
    (!estadoDeliveryFiltro || row.estado === estadoDeliveryFiltro)
    && (!distritoDeliveryFiltro || String(row.distritoId ?? '') === distritoDeliveryFiltro)
    && (!repartidorDeliveryFiltro || String(row.repartidorId ?? '') === repartidorDeliveryFiltro)
    && cumpleRango(row.costoEnvio, montoDesde, montoHasta)
    && (!termino || `${row.pedido} ${row.distrito} ${row.repartidor}`.toLocaleLowerCase('es').includes(termino)));
  const ventasCanalFiltradas = analisisComercial.ventasCanal.filter((row) =>
    (!termino || `${row.canal} ${row.tipoPedido}`.toLocaleLowerCase('es').includes(termino))
    && cumpleRango(row.total, montoDesde, montoHasta));
  const ventasHorarioFiltradas = analisisComercial.ventasHorario.filter((row) =>
    (!termino || `${row.diaSemana} ${row.hora}`.toLocaleLowerCase('es').includes(termino))
    && cumpleRango(row.total, montoDesde, montoHasta));
  const ticketsFiltrados = analisisComercial.ticketPromedio.filter((row) =>
    cumpleRango(row.total, montoDesde, montoHasta));
  const pedidosAnuladosFiltrados = analisisComercial.pedidosAnulados.filter((row) =>
    (!termino || `${row.numero} ${row.tipo} ${row.responsable} ${row.motivo ?? ''}`.toLocaleLowerCase('es').includes(termino))
    && cumpleRango(row.total, montoDesde, montoHasta));
  const notasCreditoFiltradas = analisisComercial.notasCredito.filter((row) =>
    (!termino || `${row.serie} ${row.numero} ${row.serieReferencia} ${row.numeroReferencia} ${row.motivo} ${row.estadoSunat ?? ''}`.toLocaleLowerCase('es').includes(termino))
    && cumpleRango(row.monto, montoDesde, montoHasta));
  const clientesFrecuentesFiltrados = analisisComercial.clientesFrecuentes.filter((row) =>
    (!termino || row.nombre.toLocaleLowerCase('es').includes(termino))
    && cumpleRango(row.total, montoDesde, montoHasta));
  const ventasPorMesaFiltradas = analisisComercial.ventasPorMesa.filter((row) =>
    (!termino || `${row.mesa} ${row.ambiente}`.toLocaleLowerCase('es').includes(termino))
    && cumpleRango(row.total, montoDesde, montoHasta));
  const ventasPorEmpleadoFiltradas = analisisComercial.ventasPorEmpleado.filter((row) =>
    (!termino || row.empleado.toLocaleLowerCase('es').includes(termino))
    && cumpleRango(row.total, montoDesde, montoHasta));
  const desgloseFiscalFiltrado = analisisComercial.desgloseFiscal.filter((row) =>
    cumpleRango(row.total, montoDesde, montoHasta));
  const ventasAnuladasFiltradas = analisisComercial.ventasAnuladas.filter((row) =>
    (!termino || `${row.tipoDocumento} ${row.responsable} ${row.motivo ?? ''}`.toLocaleLowerCase('es').includes(termino))
    && cumpleRango(row.total, montoDesde, montoHasta));
  const estadoSunatFiltrado = analisisComercial.estadoSunat.filter((row) =>
    (!estadoSunatFiltro || row.estadoRegistrado === estadoSunatFiltro)
    &&
    (!termino || `${row.tipoDocumento} ${row.serie} ${row.numero} ${row.estadoRegistrado}`.toLocaleLowerCase('es').includes(termino))
    && cumpleRango(row.total, montoDesde, montoHasta));
  const pagosPorOperacionFiltrados = analisisComercial.pagosPorOperacion.filter((row) =>
    (!medioPagoFiltro || row.metodoPago === medioPagoFiltro)
    && (!termino || `${row.tipoDocumento} ${row.referencia ?? ''} ${row.ventaId}`.toLocaleLowerCase('es').includes(termino))
    && cumpleRango(row.monto, montoDesde, montoHasta));
  const ventasPorTipoClienteFiltradas = analisisComercial.ventasPorTipoCliente.filter((row) =>
    (!termino || row.tipo.toLocaleLowerCase('es').includes(termino))
    && cumpleRango(row.total, montoDesde, montoHasta));
  const resumenCajaFiltrado = analisisComercial.resumenCaja.filter((row) =>
    (!cajaFiltro || row.caja === cajaFiltro)
    && (!estadoTurnoFiltro || row.situacion === estadoTurnoFiltro)
    && (!termino || `${row.caja} ${row.turno}`.toLocaleLowerCase('es').includes(termino))
    && cumpleRango(row.montoSistema, montoDesde, montoHasta));

  const cajas = opcionesUnicas([...arqueo.map((row) => row.caja), ...comprobantes.map((row) => row.caja), ...movimientos.map((row) => row.caja)]);
  const responsablesArqueo = opcionesUnicas(arqueo.map((row) => row.usuarioApertura));
  const responsablesPagos = opcionesUnicas(pagos.map((row) => row.usuario));
  const responsablesComprobantes = opcionesUnicas(comprobantes.map((row) => row.usuario));
  const responsablesMovimientos = opcionesUnicas(movimientos.map((row) => row.usuario));
  const mediosPago = opcionesUnicas([...pagos.map((row) => row.metodoPago), ...movimientos.map((row) => row.metodoPago)]);
  const categorias = opcionesUnicas(productos.map((row) => row.categoria));
  const distritosDelivery = Array.from(new Map(delivery
    .filter((row) => row.distritoId !== null)
    .map((row) => [row.distritoId as number, row.distrito])).entries());
  const repartidoresDelivery = Array.from(new Map(delivery
    .filter((row) => row.repartidorId !== null)
    .map((row) => [row.repartidorId as number, row.repartidor])).entries());

  const reportesExportables: ReporteExportable[] = [
    {
      id: 'ventas',
      title: 'Ventas por día',
      sheetName: 'Ventas',
      columns: ['Fecha', 'Comprobante', 'Cantidad', 'Subtotal', 'IGV', 'Total vendido'],
      rows: ventasFiltradas.map((row) => [
        row.fecha, tipoDocumento(row.tipodocumento), row.comprobantes, row.subtotal, row.igv, row.total,
      ]),
    },
    {
      id: 'productos',
      title: `Productos más vendidos (Top ${limiteProductos})`,
      sheetName: 'Productos top',
      columns: ['Producto', 'Categoría', 'Unidades vendidas', 'Importe vendido'],
      rows: productosFiltrados.map((row) => [row.producto, row.categoria, row.cantidad, row.total]),
    },
    {
      id: 'categorias',
      title: 'Ventas por categoría',
      sheetName: 'Ventas categoría',
      columns: ['Categoría', 'Productos vendidos', 'Unidades', 'Importe vendido'],
      rows: ventasCategoriaFiltradas.map((row) => [row.categoria, row.cantidadProductos, row.unidades, row.total]),
    },
    {
      id: 'arqueo',
      title: 'Arqueos de caja',
      sheetName: 'Arqueos',
      columns: [
        'Caja', 'Turno', 'Apertura', 'Cierre', 'Responsable apertura', 'Responsable cierre',
        'Monto inicial', 'Ingresos', 'Egresos', 'Saldo sistema', 'Efectivo declarado', 'Diferencia', 'Estado',
      ],
      rows: arqueoFiltrado.map((row) => [
        row.caja, row.numeroTurno, formatoFecha(row.fechaApertura), formatoFecha(row.fechaCierre),
        row.usuarioApertura, row.usuarioCierre ?? '—', row.montoInicial, row.totalIngresos,
        row.totalEgresos, row.montoSistema, row.montoDeclarado, row.diferencia,
        row.situacion === 'C' ? 'Cerrado' : 'Abierto',
      ]),
    },
    {
      id: 'pagos',
      title: 'Pagos por medio',
      sheetName: 'Pagos por medio',
      columns: ['Fecha', 'Medio de pago', 'Responsable', 'Comprobantes', 'Operaciones', 'Total cobrado', 'Afecta efectivo'],
      rows: pagosFiltrados.map((row) => [
        row.fecha, row.metodoPago, row.usuario, row.comprobantes, row.operaciones, row.total,
        row.efectivoFisico ? 'Sí' : 'No',
      ]),
    },
    {
      id: 'comprobantes',
      title: 'Comprobantes emitidos',
      sheetName: 'Comprobantes',
      columns: ['Fecha', 'Tipo', 'Serie', 'Número', 'Caja', 'Turno', 'Responsable', 'Total'],
      rows: comprobantesFiltrados.map((row) => [
        formatoFecha(row.fecha), tipoDocumento(row.tipoDocumento), row.serie, row.numero,
        row.caja, row.turno, row.usuario, row.total,
      ]),
    },
    {
      id: 'movimientos',
      title: 'Movimientos de caja',
      sheetName: 'Movimientos',
      columns: ['Fecha', 'Caja', 'Turno', 'Tipo', 'Concepto', 'Medio', 'Detalle', 'Responsable', 'Monto'],
      rows: movimientosFiltrados.map((row) => [
        formatoFecha(row.fecha), row.caja, row.turno, row.tipoMovimiento, row.concepto,
        row.metodoPago,
        [row.descripcion, row.banco, row.referencia].filter(Boolean).join(' · ') || '—',
        row.usuario,
        row.monto,
      ]),
    },
    {
      id: 'reservas',
      title: 'Reservas',
      sheetName: 'Reservas',
      columns: ['Fecha y hora', 'Cliente', 'Mesa', 'Personas', 'Adelanto', 'Estado', 'Responsable', 'Observación'],
      rows: reservasFiltradas.map((row) => [
        formatoFecha(row.fecha), row.cliente, row.mesa, row.personas, row.adelanto,
        row.estado, row.responsable, row.observacion ?? '',
      ]),
    },
    {
      id: 'delivery',
      title: 'Delivery por distrito y repartidor',
      sheetName: 'Delivery',
      columns: ['Pedido', 'Distrito', 'Repartidor', 'Estado registrado', 'Costo de envío', 'Creado', 'Salida registrada', 'Entrega registrada'],
      rows: deliveryFiltrado.map((row) => [
        row.pedido, row.distrito, row.repartidor, row.estado, row.costoEnvio,
        formatoFecha(row.fechaCreacion), formatoFecha(row.fechaSalida), formatoFecha(row.fechaEntrega),
      ]),
    },
    {
      id: 'canales',
      title: 'Ventas por canal y tipo de pedido',
      sheetName: 'Ventas por canal',
      columns: ['Canal de origen', 'Tipo de pedido', 'Comprobantes', 'Total vendido'],
      rows: ventasCanalFiltradas.map((row) => [row.canal, row.tipoPedido, row.comprobantes, row.total]),
    },
    {
      id: 'horarios',
      title: 'Actividad por día y hora',
      sheetName: 'Actividad horaria',
      columns: ['Día de semana', 'Hora', 'Comprobantes', 'Total vendido'],
      rows: ventasHorarioFiltradas.map((row) => [row.diaSemana, row.hora, row.comprobantes, row.total]),
    },
    {
      id: 'ticket',
      title: 'Ticket promedio y ventas por comensal',
      sheetName: 'Ticket promedio',
      columns: ['Fecha', 'Comprobantes', 'Comensales registrados', 'Total vendido', 'Ticket promedio', 'Venta por comensal'],
      rows: ticketsFiltrados.map((row) => [
        row.fecha, row.comprobantes, row.comensales, row.total, row.ticketPromedio,
        row.ticketPorComensal ?? 'Sin dato',
      ]),
    },
    {
      id: 'anulaciones',
      title: 'Pedidos anulados',
      sheetName: 'Pedidos anulados',
      columns: ['Pedido', 'Fecha', 'Tipo', 'Responsable registrado', 'Comensales', 'Total del pedido', 'Motivo registrado'],
      rows: pedidosAnuladosFiltrados.map((row) => [
        row.numero, formatoFecha(row.fechaPedido), row.tipo, row.responsable, row.comensales,
        row.total, row.motivo ?? 'Sin motivo registrado',
      ]),
    },
    {
      id: 'notas-credito',
      title: 'Notas de crédito',
      sheetName: 'Notas de crédito',
      columns: ['Fecha', 'Nota', 'Comprobante referenciado', 'Motivo', 'Monto', 'Estado SUNAT registrado'],
      rows: notasCreditoFiltradas.map((row) => [
        formatoFecha(row.fecha), `${row.serie}-${row.numero}`,
        `${row.tipoDocumentoReferencia} ${row.serieReferencia}-${row.numeroReferencia}`,
        row.motivo, row.monto, row.estadoSunat ?? 'Sin estado registrado',
      ]),
    },
    {
      id: 'clientes',
      title: 'Clientes frecuentes',
      sheetName: 'Clientes frecuentes',
      columns: ['Cliente', 'Compras', 'Total comprado', 'Ticket promedio', 'Última compra'],
      rows: clientesFrecuentesFiltrados.map((row) => [
        row.nombre, row.compras, row.total, row.ticketPromedio, formatoFecha(row.ultimaCompra),
      ]),
    },
    {
      id: 'mesas',
      title: 'Ventas por mesa y ambiente',
      sheetName: 'Ventas por mesa',
      columns: ['Ambiente', 'Mesa', 'Comprobantes', 'Total vendido'],
      rows: ventasPorMesaFiltradas.map((row) => [row.ambiente, row.mesa, row.comprobantes, row.total]),
    },
    {
      id: 'empleados',
      title: 'Ventas por empleado asignado',
      sheetName: 'Ventas por empleado',
      columns: ['Empleado asignado', 'Comprobantes', 'Total vendido'],
      rows: ventasPorEmpleadoFiltradas.map((row) => [row.empleado, row.comprobantes, row.total]),
    },
    {
      id: 'fiscal',
      title: 'Desglose fiscal y comercial',
      sheetName: 'Desglose fiscal',
      columns: ['Fecha', 'Comprobantes', 'Subtotal', 'Descuento', 'Servicio', 'IGV', 'Total'],
      rows: desgloseFiscalFiltrado.map((row) => [row.fecha, row.comprobantes, row.subtotal, row.descuento, row.servicio, row.igv, row.total]),
    },
    {
      id: 'ventas-anuladas',
      title: 'Ventas anuladas',
      sheetName: 'Ventas anuladas',
      columns: ['Venta', 'Fecha registrada', 'Documento', 'Responsable registrado', 'Total', 'Motivo registrado'],
      rows: ventasAnuladasFiltradas.map((row) => [row.id, formatoFecha(row.fechaVenta), tipoDocumento(row.tipoDocumento), row.responsable, row.total, row.motivo ?? 'Sin motivo registrado']),
    },
    {
      id: 'sunat',
      title: 'Estado SUNAT registrado',
      sheetName: 'SUNAT registrado',
      columns: ['Venta', 'Documento', 'Fecha', 'Total', 'Estado guardado localmente'],
      rows: estadoSunatFiltrado.map((row) => [row.ventaId, `${row.tipoDocumento} ${row.serie}-${row.numero}`, formatoFecha(row.fecha), row.total, row.estadoRegistrado]),
    },
    {
      id: 'pagos-operacion',
      title: 'Detalle de pagos por operación',
      sheetName: 'Detalle de pagos',
      columns: ['Pago', 'Venta', 'Fecha de pago', 'Documento', 'Medio', 'Monto', 'Referencia'],
      rows: pagosPorOperacionFiltrados.map((row) => [row.id, row.ventaId, formatoFecha(row.fechaPago), tipoDocumento(row.tipoDocumento), row.metodoPago, row.monto, row.referencia ?? '—']),
    },
    {
      id: 'reservas-estado',
      title: 'Reservas por estado',
      sheetName: 'Reservas por estado',
      columns: ['Estado registrado', 'Cantidad'],
      rows: analisisComercial.reservasPorEstado.map((row) => [etiquetaEstadoReserva(row.estado), row.cantidad]),
    },
    {
      id: 'tipo-cliente',
      title: 'Ventas por tipo de cliente',
      sheetName: 'Ventas tipo cliente',
      columns: ['Tipo de cliente', 'Comprobantes', 'Total vendido'],
      rows: ventasPorTipoClienteFiltradas.map((row) => [row.tipo, row.comprobantes, row.total]),
    },
    {
      id: 'comparacion',
      title: 'Comparación con periodo anterior',
      sheetName: 'Comparación periodos',
      columns: ['Periodo actual', 'Ventas actual', 'Periodo anterior', 'Ventas anterior', 'Diferencia', 'Variación %'],
      rows: analisisComercial.comparacionPeriodos
        ? [[
            `${analisisComercial.comparacionPeriodos.desde} a ${analisisComercial.comparacionPeriodos.hasta}`,
            analisisComercial.comparacionPeriodos.ventasActuales,
            `${analisisComercial.comparacionPeriodos.anteriorDesde} a ${analisisComercial.comparacionPeriodos.anteriorHasta}`,
            analisisComercial.comparacionPeriodos.ventasAnteriores,
            analisisComercial.comparacionPeriodos.diferencia,
            analisisComercial.comparacionPeriodos.variacionPorcentual ?? 'Sin base anterior',
          ]]
        : [],
    },
    {
      id: 'caja-resumen',
      title: 'Resumen diario por apertura de caja',
      sheetName: 'Resumen de caja',
      columns: ['Caja', 'Turno', 'Apertura', 'Cierre', 'Ventas registradas', 'Ingresos turno', 'Egresos turno', 'Sistema', 'Declarado', 'Diferencia'],
      rows: resumenCajaFiltrado.map((row) => [
        row.caja, row.turno, formatoFecha(row.fechaApertura), formatoFecha(row.fechaCierre),
        row.ventasRegistradas, row.ingresosTurno, row.egresosTurno, row.montoSistema, row.montoDeclarado, row.diferencia,
      ]),
    },
  ];

  const reporteActivo = reportesExportables.find((reporte) => reporte.id === tab);

  const filtrosAplicados = [
    (tab === 'ventas' || tab === 'comprobantes') && tipoDocumentoFiltro
      ? `documento: ${tipoDocumento(tipoDocumentoFiltro)}` : '',
    tab === 'productos' && categoriaFiltro ? `categoría: ${categoriaFiltro}` : '',
    tab === 'reservas' && estadoReservaFiltro ? `estado: ${estadoReservaFiltro}` : '',
    tab === 'reservas' && personasDesde ? `personas desde: ${personasDesde}` : '',
    tab === 'reservas' && personasHasta ? `personas hasta: ${personasHasta}` : '',
    tab === 'delivery' && estadoDeliveryFiltro ? `estado delivery: ${estadoDeliveryFiltro}` : '',
    tab === 'delivery' && distritoDeliveryFiltro
      ? `distrito: ${distritosDelivery.find(([id]) => String(id) === distritoDeliveryFiltro)?.[1] ?? distritoDeliveryFiltro}` : '',
    tab === 'delivery' && repartidorDeliveryFiltro
      ? `repartidor: ${repartidoresDelivery.find(([id]) => String(id) === repartidorDeliveryFiltro)?.[1] ?? repartidorDeliveryFiltro}` : '',
    (tab === 'canales' || tab === 'horarios' || tab === 'anulaciones' || tab === 'notas-credito' || tab === 'clientes' || tab === 'mesas' || tab === 'empleados' || tab === 'ventas-anuladas' || tab === 'sunat' || tab === 'pagos-operacion' || tab === 'tipo-cliente' || tab === 'caja-resumen') && busqueda.trim()
      ? `búsqueda: ${busqueda.trim()}` : '',
    (tab === 'arqueo' || tab === 'comprobantes' || tab === 'movimientos' || tab === 'caja-resumen') && cajaFiltro
      ? `caja: ${cajaFiltro}` : '',
    (tab === 'arqueo' || tab === 'caja-resumen') && estadoTurnoFiltro
      ? `estado: ${estadoTurnoFiltro === 'C' ? 'cerrado' : estadoTurnoFiltro === 'P' ? 'pendiente' : 'abierto'}` : '',
    tab === 'sunat' && estadoSunatFiltro ? `estado SUNAT registrado: ${estadoSunatFiltro}` : '',
    (tab === 'arqueo' || tab === 'pagos' || tab === 'comprobantes' || tab === 'movimientos') && responsableFiltro
      ? `responsable: ${responsableFiltro}` : '',
    (tab === 'pagos' || tab === 'movimientos' || tab === 'pagos-operacion') && medioPagoFiltro ? `medio: ${medioPagoFiltro}` : '',
    tab === 'movimientos' && tipoMovimientoFiltro ? `movimiento: ${tipoMovimientoFiltro}` : '',
    (tab === 'pagos' || tab === 'movimientos') && afectaEfectivoFiltro
      ? `afecta efectivo: ${afectaEfectivoFiltro === 'true' ? 'sí' : 'no'}` : '',
    (tab === 'productos' || tab === 'comprobantes' || tab === 'movimientos' || tab === 'reservas' || tab === 'delivery' || tab === 'categorias') && busqueda.trim()
      ? `búsqueda: ${busqueda.trim()}` : '',
    (tab === 'ventas' || tab === 'productos' || tab === 'categorias' || tab === 'arqueo' || tab === 'pagos' || tab === 'comprobantes' || tab === 'movimientos' || tab === 'reservas' || tab === 'delivery' || tab === 'mesas' || tab === 'empleados' || tab === 'fiscal' || tab === 'ventas-anuladas' || tab === 'sunat' || tab === 'pagos-operacion' || tab === 'tipo-cliente' || tab === 'caja-resumen') && montoDesde
      ? `monto desde: S/ ${montoDesde}` : '',
    (tab === 'ventas' || tab === 'productos' || tab === 'categorias' || tab === 'arqueo' || tab === 'pagos' || tab === 'comprobantes' || tab === 'movimientos' || tab === 'reservas' || tab === 'delivery' || tab === 'mesas' || tab === 'empleados' || tab === 'fiscal' || tab === 'ventas-anuladas' || tab === 'sunat' || tab === 'pagos-operacion' || tab === 'tipo-cliente' || tab === 'caja-resumen') && montoHasta
      ? `monto hasta: S/ ${montoHasta}` : '',
    tab === 'productos' ? `Top ${limiteProductos}` : '',
  ].filter(Boolean).join(' · ');

  const exportar = async (formato: 'pdf' | 'excel') => {
    if (!reporteActivo) return;
    setExportando(true);
    setError(null);
    try {
      if (formato === 'pdf') await exportarReportesPdf([reporteActivo], periodo, filtrosAplicados);
      else await exportarReportesExcel([reporteActivo], periodo, filtrosAplicados);
    } catch (cause) {
      console.error('No se pudo exportar el informe', cause);
      setError('No se pudo crear el archivo. Intenta nuevamente.');
    } finally {
      setExportando(false);
    }
  };

  const tablasAdicionales: Partial<Record<ReportTab, {
    columnas: string[];
    filas: React.ReactNode[][];
    mensajeVacio: string;
    nota?: string;
    alinearDerecha?: number[];
  }>> = {
    mesas: {
      columnas: ['Ambiente', 'Mesa', 'Comprobantes', 'Total vendido'],
      filas: ventasPorMesaFiltradas.map((row) => [row.ambiente, row.mesa, row.comprobantes, fmt(row.total)]),
      mensajeVacio: 'No hay ventas asociadas a mesas en el periodo.',
      alinearDerecha: [2, 3],
    },
    empleados: {
      columnas: ['Empleado asignado al pedido', 'Comprobantes', 'Total vendido'],
      filas: ventasPorEmpleadoFiltradas.map((row) => [row.empleado, row.comprobantes, fmt(row.total)]),
      mensajeVacio: 'No hay ventas con empleado asignado en el periodo.',
      nota: 'La atribución corresponde al empleado asociado al pedido; no identifica necesariamente quién realizó cada acción.',
      alinearDerecha: [1, 2],
    },
    fiscal: {
      columnas: ['Fecha', 'Comprobantes', 'Subtotal', 'Descuento', 'Servicio', 'IGV', 'Total'],
      filas: desgloseFiscalFiltrado.map((row) => [row.fecha, row.comprobantes, fmt(row.subtotal), fmt(row.descuento), fmt(row.servicio), fmt(row.igv), fmt(row.total)]),
      mensajeVacio: 'No hay ventas para desglosar en el periodo.',
      alinearDerecha: [1, 2, 3, 4, 5, 6],
    },
    'ventas-anuladas': {
      columnas: ['Venta', 'Fecha de venta', 'Documento', 'Responsable registrado', 'Total', 'Motivo'],
      filas: ventasAnuladasFiltradas.map((row) => [row.id, formatoFecha(row.fechaVenta), tipoDocumento(row.tipoDocumento), row.responsable, fmt(row.total), row.motivo ?? 'Sin motivo registrado']),
      mensajeVacio: 'No hay ventas anuladas en el periodo.',
      nota: 'La fecha corresponde a la venta; el sistema no registra una fecha independiente de anulación.',
      alinearDerecha: [4],
    },
    sunat: {
      columnas: ['Venta', 'Documento', 'Fecha', 'Total', 'Estado SUNAT registrado'],
      filas: estadoSunatFiltrado.map((row) => [row.ventaId, `${row.tipoDocumento} ${row.serie}-${row.numero}`, formatoFecha(row.fecha), fmt(row.total), row.estadoRegistrado]),
      mensajeVacio: 'No hay comprobantes fiscales en el periodo.',
      nota: 'El estado mostrado es el valor guardado localmente; no es una consulta en tiempo real a SUNAT.',
      alinearDerecha: [3],
    },
    'pagos-operacion': {
      columnas: ['Pago', 'Venta', 'Fecha de pago', 'Documento', 'Medio', 'Monto', 'Referencia'],
      filas: pagosPorOperacionFiltrados.map((row) => [row.id, row.ventaId, formatoFecha(row.fechaPago), tipoDocumento(row.tipoDocumento), row.metodoPago, fmt(row.monto), row.referencia ?? '—']),
      mensajeVacio: 'No hay operaciones de pago en el periodo.',
      nota: 'Cada fila es una operación individual; en pagos mixtos una venta puede aparecer en varias filas.',
      alinearDerecha: [1, 5],
    },
    'reservas-estado': {
      columnas: ['Estado registrado', 'Cantidad'],
      filas: analisisComercial.reservasPorEstado.map((row) => [etiquetaEstadoReserva(row.estado), row.cantidad]),
      mensajeVacio: 'No hay reservas en el periodo.',
      alinearDerecha: [1],
    },
    'tipo-cliente': {
      columnas: ['Tipo de cliente', 'Comprobantes', 'Total vendido'],
      filas: ventasPorTipoClienteFiltradas.map((row) => [row.tipo, row.comprobantes, fmt(row.total)]),
      mensajeVacio: 'No hay ventas por tipo de cliente en el periodo.',
      alinearDerecha: [1, 2],
    },
    comparacion: {
      columnas: ['Periodo', 'Ventas'],
      filas: analisisComercial.comparacionPeriodos
        ? [
            [`Actual: ${analisisComercial.comparacionPeriodos.desde} a ${analisisComercial.comparacionPeriodos.hasta}`, fmt(analisisComercial.comparacionPeriodos.ventasActuales)],
            [`Anterior: ${analisisComercial.comparacionPeriodos.anteriorDesde} a ${analisisComercial.comparacionPeriodos.anteriorHasta}`, fmt(analisisComercial.comparacionPeriodos.ventasAnteriores)],
            ['Diferencia', fmt(analisisComercial.comparacionPeriodos.diferencia)],
            ['Variación', analisisComercial.comparacionPeriodos.variacionPorcentual === null
              ? 'Sin base anterior'
              : `${analisisComercial.comparacionPeriodos.variacionPorcentual.toFixed(2)}%`],
          ]
        : [],
      mensajeVacio: 'Selecciona un rango completo válido para comparar con el periodo anterior.',
      alinearDerecha: [1],
    },
    'caja-resumen': {
      columnas: ['Caja', 'Turno', 'Apertura', 'Cierre', 'Ventas registradas', 'Ingresos turno', 'Egresos turno', 'Sistema', 'Declarado', 'Diferencia'],
      filas: resumenCajaFiltrado.map((row) => [
        row.caja, row.turno, formatoFecha(row.fechaApertura), formatoFecha(row.fechaCierre),
        fmt(row.ventasRegistradas), fmt(row.ingresosTurno), fmt(row.egresosTurno), fmt(row.montoSistema),
        fmt(row.montoDeclarado), fmt(row.diferencia),
      ]),
      mensajeVacio: 'No hay aperturas de caja para el periodo.',
      nota: 'Ventas registradas e ingresos del turno se muestran por separado. No sumar ambos: pueden representar los mismos cobros.',
      alinearDerecha: [4, 5, 6, 7, 8, 9],
    },
  };

  const tablaConfig = tablasAdicionales[tab as keyof typeof tablasAdicionales] ?? undefined;

  const tabsCategoria = CATEGORIAS[categoria]?.tabs ?? CATEGORIAS.ventas.tabs;
  const tabValido = tabsCategoria.includes(tab) ? tab : tabsCategoria[0];
  const colorCat = CLASES_CATEGORIA[categoria] ?? CLASES_CATEGORIA.ventas;

  return (
    <div className="y-shell" style={{ padding: '24px 16px 140px', maxWidth: 1240, margin: '0 auto' }}>
      <header className="y-panel" style={{ padding: 22, marginBottom: 16 }}>
        <p style={{ margin: '0 0 4px', color: 'var(--accent)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
          Control del negocio
        </p>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--fg)', margin: '0 0 6px' }}>Reportes del sistema</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          Elige el periodo y combina filtros para consultar el detalle que necesitas. Cada reporte se puede exportar por separado.
        </p>
      </header>


      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Ventas del periodo', value: fmt(ventasFiltradas.reduce((total, row) => total + row.total, 0)) },
          { label: 'Comprobantes coincidentes', value: comprobantesFiltrados.length.toLocaleString('es-PE') },
          { label: 'Movimientos coincidentes', value: movimientosFiltrados.length.toLocaleString('es-PE') },
        ].map((item) => (
          <article key={item.label} className="y-panel" style={{ padding: 16 }}>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 12 }}>{item.label}</p>
            <strong style={{ display: 'block', marginTop: 6, color: 'var(--fg)', fontSize: 20 }}>{item.value}</strong>
          </article>
        ))}
      </section>

      <div className="mb-3">
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 6 }}>Categoría</p>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Categorías de reportes">
          {Object.entries(CATEGORIAS).map(([key, cat]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={categoria === key}
              onClick={() => { setCategoria(key); setTab(cat.tabs[0]); }}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors border ${categoria === key ? `${colorCat.bg} text-white ring-2 shadow-sm` : 'bg-[#F5F5F5] text-[#333] hover:bg-[#D9D9D9] border-transparent'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 border-t border-[#E5E5E5] pt-4">
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 6 }}>Reportes</p>
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Reportes">
        {tabsCategoria.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tabValido === t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors border ${tabValido === t ? `${colorCat.bg} text-white ring-2 shadow-sm` : 'bg-[#F5F5F5] text-[#333] hover:bg-[#D9D9D9] border-transparent'}`}
          >
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>
      </div>

      <section className="y-panel" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0, color: 'var(--fg)', fontSize: 16 }}>Filtros: {reporteActivo?.title}</h2>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 12 }}>
              Los filtros se aplican tanto a la tabla como a los archivos descargados.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={`rounded-lg border ${colorCat.border} px-4 py-2 text-sm font-semibold ${colorCat.text} hover:bg-gray-50 disabled:opacity-50`} disabled={cargando || exportando} onClick={() => void exportar('pdf')} title="Descargar PDF">
              {exportando ? '…' : 'PDF'}
            </button>
            <button type="button" className={`rounded-lg ${colorCat.bg} px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50`} disabled={cargando || exportando} onClick={() => void exportar('excel')} title="Descargar Excel">
              {exportando ? '…' : 'Excel'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10, marginTop: 16 }}>
          <label style={filterLabel}>
            Desde
            <input aria-label="Fecha desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm" />
          </label>
          <label style={filterLabel}>
            Hasta
            <input aria-label="Fecha hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm" />
          </label>
          <label style={filterLabel}>
            Monto mínimo
            <input className="input" type="number" min="0" step="0.01" value={montoDesde} onChange={(e) => setMontoDesde(e.target.value)} placeholder="S/ 0.00" />
          </label>
          <label style={filterLabel}>
            Monto máximo
            <input className="input" type="number" min="0" step="0.01" value={montoHasta} onChange={(e) => setMontoHasta(e.target.value)} placeholder="Sin límite" />
          </label>
          {tab === 'ventas' && (
            <label style={filterLabel}>
              Tipo de comprobante
              <select className="select" value={tipoDocumentoFiltro} onChange={(event) => setTipoDocumentoFiltro(event.target.value)}>
                <option value="">Todos</option><option value="03">Boleta</option><option value="01">Factura</option>
              </select>
            </label>
          )}
          {tab === 'sunat' && (
            <label style={filterLabel}>
              Estado SUNAT registrado
              <select className="select" value={estadoSunatFiltro} onChange={(event) => setEstadoSunatFiltro(event.target.value)}>
                <option value="">Todos</option>{opcionesUnicas(analisisComercial.estadoSunat.map((row) => row.estadoRegistrado)).map((estado) => <option key={estado} value={estado}>{estado}</option>)}
              </select>
            </label>
          )}
          {tab === 'productos' && (
            <>
              <label style={filterLabel}>
                Mostrar Top
                <select className="select" value={limiteProductos} onChange={(event) => setLimiteProductos(event.target.value)}>
                  <option value="10">10 productos</option><option value="20">20 productos</option>
                  <option value="50">50 productos</option><option value="100">100 productos</option>
                </select>
              </label>
              <label style={filterLabel}>
                Categoría
                <select className="select" value={categoriaFiltro} onChange={(event) => setCategoriaFiltro(event.target.value)}>
                  <option value="">Todas las categorías</option>
                  {categorias.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
                </select>
              </label>
              <label style={filterLabel}>
                Buscar producto
                <input className="input" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Nombre o categoría" />
              </label>
            </>
          )}
          {tab === 'categorias' && (
            <label style={filterLabel}>
              Buscar categoría
              <input className="input" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Nombre de categoría" />
            </label>
          )}
          {['arqueo', 'comprobantes', 'movimientos', 'caja-resumen'].includes(tab) && (
            <label style={filterLabel}>
              Caja
              <select className="select" value={cajaFiltro} onChange={(event) => setCajaFiltro(event.target.value)}>
                <option value="">Todas las cajas</option>{cajas.map((caja) => <option key={caja} value={caja}>{caja}</option>)}
              </select>
            </label>
          )}
          {(tab === 'arqueo' || tab === 'caja-resumen') && (
            <>
              <label style={filterLabel}>
                Estado del turno
                <select className="select" value={estadoTurnoFiltro} onChange={(event) => setEstadoTurnoFiltro(event.target.value)}>
                  <option value="">Todos</option><option value="A">Abierto</option><option value="P">Pendiente</option><option value="C">Cerrado</option>
                </select>
              </label>
              <label style={filterLabel}>
                Cajero de apertura
                <select className="select" value={responsableFiltro} onChange={(event) => setResponsableFiltro(event.target.value)}>
                  <option value="">Todos</option>{responsablesArqueo.map((responsable) => <option key={responsable} value={responsable}>{responsable}</option>)}
                </select>
              </label>
            </>
          )}
          {tab === 'pagos' && (
            <>
              <label style={filterLabel}>
                Medio de pago
                <select className="select" value={medioPagoFiltro} onChange={(event) => setMedioPagoFiltro(event.target.value)}>
                  <option value="">Todos</option>{opcionesUnicas(pagos.map((row) => row.metodoPago)).map((medio) => <option key={medio} value={medio}>{medio}</option>)}
                </select>
              </label>
              <label style={filterLabel}>
                Responsable
                <select className="select" value={responsableFiltro} onChange={(event) => setResponsableFiltro(event.target.value)}>
                  <option value="">Todos</option>{responsablesPagos.map((responsable) => <option key={responsable} value={responsable}>{responsable}</option>)}
                </select>
              </label>
              <label style={filterLabel}>
                Afecta efectivo físico
                <select className="select" value={afectaEfectivoFiltro} onChange={(event) => setAfectaEfectivoFiltro(event.target.value)}>
                  <option value="">Todos</option><option value="true">Sí</option><option value="false">No</option>
                </select>
              </label>
            </>
          )}
          {tab === 'pagos-operacion' && (
            <label style={filterLabel}>
              Medio de pago
              <select className="select" value={medioPagoFiltro} onChange={(event) => setMedioPagoFiltro(event.target.value)}>
                <option value="">Todos</option>{opcionesUnicas(analisisComercial.pagosPorOperacion.map((row) => row.metodoPago)).map((medio) => <option key={medio} value={medio}>{medio}</option>)}
              </select>
            </label>
          )}
          {tab === 'comprobantes' && (
            <>
              <label style={filterLabel}>
                Tipo de comprobante
                <select className="select" value={tipoDocumentoFiltro} onChange={(event) => setTipoDocumentoFiltro(event.target.value)}>
                  <option value="">Todos</option><option value="03">Boleta</option><option value="01">Factura</option>
                </select>
              </label>
              <label style={filterLabel}>
                Responsable
                <select className="select" value={responsableFiltro} onChange={(event) => setResponsableFiltro(event.target.value)}>
                  <option value="">Todos</option>{responsablesComprobantes.map((responsable) => <option key={responsable} value={responsable}>{responsable}</option>)}
                </select>
              </label>
              <label style={filterLabel}>
                Buscar serie, número o responsable
                <input className="input" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Ej. B001, 00001234" />
              </label>
            </>
          )}
          {tab === 'movimientos' && (
            <>
              <label style={filterLabel}>
                Tipo de movimiento
                <select className="select" value={tipoMovimientoFiltro} onChange={(event) => setTipoMovimientoFiltro(event.target.value)}>
                  <option value="">Ingresos y egresos</option>{opcionesUnicas(movimientos.map((row) => row.tipoMovimiento)).map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
                </select>
              </label>
              <label style={filterLabel}>
                Medio de pago
                <select className="select" value={medioPagoFiltro} onChange={(event) => setMedioPagoFiltro(event.target.value)}>
                  <option value="">Todos</option>{mediosPago.map((medio) => <option key={medio} value={medio}>{medio}</option>)}
                </select>
              </label>
              <label style={filterLabel}>
                Responsable
                <select className="select" value={responsableFiltro} onChange={(event) => setResponsableFiltro(event.target.value)}>
                  <option value="">Todos</option>{responsablesMovimientos.map((responsable) => <option key={responsable} value={responsable}>{responsable}</option>)}
                </select>
              </label>
              <label style={filterLabel}>
                Afecta efectivo físico
                <select className="select" value={afectaEfectivoFiltro} onChange={(event) => setAfectaEfectivoFiltro(event.target.value)}>
                  <option value="">Todos</option><option value="true">Sí</option><option value="false">No</option>
                </select>
              </label>
              <label style={filterLabel}>
                Buscar concepto o referencia
                <input className="input" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Concepto, operación, banco" />
              </label>
            </>
          )}
          {tab === 'reservas' && (
            <>
              <label style={filterLabel}>
                Estado de reserva
                <select className="select" value={estadoReservaFiltro} onChange={(event) => setEstadoReservaFiltro(event.target.value)}>
                  <option value="">Todos</option><option value="P">Pendiente</option><option value="C">Confirmada</option>
                  <option value="A">Atendida</option><option value="X">Anulada</option>
                </select>
              </label>
              <label style={filterLabel}>
                Buscar cliente, mesa o responsable
                <input className="input" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Nombre o mesa" />
              </label>
              <div style={{ ...filterLabel, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <label style={filterLabel}>Personas desde<input className="input" type="number" min="1" value={personasDesde} onChange={(event) => setPersonasDesde(event.target.value)} /></label>
                <label style={filterLabel}>Personas hasta<input className="input" type="number" min="1" value={personasHasta} onChange={(event) => setPersonasHasta(event.target.value)} /></label>
              </div>
            </>
          )}
          {tab === 'delivery' && (
            <>
              <label style={filterLabel}>
                Estado registrado
                <select className="select" value={estadoDeliveryFiltro} onChange={(event) => setEstadoDeliveryFiltro(event.target.value)}>
                  <option value="">Todos</option><option value="P">P</option><option value="R">R</option>
                  <option value="E">E</option><option value="C">C</option>
                </select>
              </label>
              <label style={filterLabel}>
                Distrito
                <select className="select" value={distritoDeliveryFiltro} onChange={(event) => setDistritoDeliveryFiltro(event.target.value)}>
                  <option value="">Todos</option>{distritosDelivery.map(([id, nombre]) => <option key={id} value={id}>{nombre}</option>)}
                </select>
              </label>
              <label style={filterLabel}>
                Repartidor
                <select className="select" value={repartidorDeliveryFiltro} onChange={(event) => setRepartidorDeliveryFiltro(event.target.value)}>
                  <option value="">Todos</option>{repartidoresDelivery.map(([id, nombre]) => <option key={id} value={id}>{nombre}</option>)}
                </select>
              </label>
              <label style={filterLabel}>
                Buscar pedido, distrito o repartidor
                <input className="input" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Número de pedido" />
              </label>
            </>
          )}
          {['canales', 'horarios', 'anulaciones', 'notas-credito', 'clientes', 'mesas', 'empleados', 'ventas-anuladas', 'sunat', 'pagos-operacion', 'tipo-cliente', 'caja-resumen'].includes(tab) && (
            <label style={filterLabel}>
              {tab === 'canales' ? 'Buscar canal o tipo de pedido'
                : tab === 'horarios' ? 'Buscar día u hora'
                  : tab === 'anulaciones' ? 'Buscar pedido, tipo o motivo'
                    : tab === 'notas-credito' ? 'Buscar nota, comprobante o motivo'
                      : tab === 'mesas' ? 'Buscar mesa o ambiente'
                        : tab === 'empleados' ? 'Buscar empleado asignado'
                          : tab === 'ventas-anuladas' ? 'Buscar documento, responsable o motivo'
                            : tab === 'sunat' ? 'Buscar comprobante o estado guardado'
                              : tab === 'pagos-operacion' ? 'Buscar referencia o venta'
                                : tab === 'tipo-cliente' ? 'Buscar tipo de cliente'
                                  : tab === 'caja-resumen' ? 'Buscar caja o turno'
                                    : 'Buscar cliente'}
              <input className="input" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} />
            </label>
          )}
          {tab !== 'productos' && tab !== 'comprobantes' && tab !== 'movimientos' && tab !== 'comparacion' && tab !== 'reservas-estado' && (
            <div style={{ ...filterLabel, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <label style={filterLabel}>{tab === 'reservas' ? 'Adelanto mínimo' : tab === 'delivery' ? 'Costo de envío mínimo' : tab === 'caja-resumen' ? 'Monto del sistema mínimo' : 'Monto mínimo'}<input className="input" type="number" min="0" step="0.01" value={montoDesde} onChange={(event) => setMontoDesde(event.target.value)} placeholder="S/ 0.00" /></label>
              <label style={filterLabel}>{tab === 'reservas' ? 'Adelanto máximo' : tab === 'delivery' ? 'Costo de envío máximo' : tab === 'caja-resumen' ? 'Monto del sistema máximo' : 'Monto máximo'}<input className="input" type="number" min="0" step="0.01" value={montoHasta} onChange={(event) => setMontoHasta(event.target.value)} placeholder="Sin límite" /></label>
            </div>
          )}
          {(tab === 'productos' || tab === 'comprobantes' || tab === 'movimientos') && (
            <>
              {tab === 'productos' && (
                <div style={{ ...filterLabel, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <label style={filterLabel}>Importe mínimo<input className="input" type="number" min="0" step="0.01" value={montoDesde} onChange={(event) => setMontoDesde(event.target.value)} placeholder="S/ 0.00" /></label>
                  <label style={filterLabel}>Importe máximo<input className="input" type="number" min="0" step="0.01" value={montoHasta} onChange={(event) => setMontoHasta(event.target.value)} placeholder="Sin límite" /></label>
                </div>
              )}
              {tab === 'comprobantes' && (
                <div style={{ ...filterLabel, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <label style={filterLabel}>Total mínimo<input className="input" type="number" min="0" step="0.01" value={montoDesde} onChange={(event) => setMontoDesde(event.target.value)} placeholder="S/ 0.00" /></label>
                  <label style={filterLabel}>Total máximo<input className="input" type="number" min="0" step="0.01" value={montoHasta} onChange={(event) => setMontoHasta(event.target.value)} placeholder="Sin límite" /></label>
                </div>
              )}
              {tab === 'movimientos' && (
                <div style={{ ...filterLabel, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <label style={filterLabel}>Monto mínimo<input className="input" type="number" min="0" step="0.01" value={montoDesde} onChange={(event) => setMontoDesde(event.target.value)} placeholder="S/ 0.00" /></label>
                  <label style={filterLabel}>Monto máximo<input className="input" type="number" min="0" step="0.01" value={montoHasta} onChange={(event) => setMontoHasta(event.target.value)} placeholder="Sin límite" /></label>
                </div>
              )}
            </>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            Resultado: {reporteActivo?.rows.length.toLocaleString('es-PE')} registros{filtrosAplicados ? ` · ${filtrosAplicados}` : ''}
          </span>
          <button type="button" className="rounded-lg border border-[#A61E22] px-4 py-2 text-sm font-semibold text-[#A61E22] hover:bg-[#A61E22]/5" onClick={() => {
            setTipoDocumentoFiltro('');
            setCategoriaFiltro('');
            setCajaFiltro('');
            setEstadoTurnoFiltro('');
            setEstadoSunatFiltro('');
            setResponsableFiltro('');
            setMedioPagoFiltro('');
            setTipoMovimientoFiltro('');
            setAfectaEfectivoFiltro('');
            setEstadoReservaFiltro('');
            setPersonasDesde('');
            setPersonasHasta('');
            setEstadoDeliveryFiltro('');
            setDistritoDeliveryFiltro('');
            setRepartidorDeliveryFiltro('');
            setBusqueda('');
            setMontoDesde('');
            setMontoHasta('');
            setLimiteProductos('50');
            setDesde('');
            setHasta('');
          }}>
            Limpiar filtros
          </button>
        </div>
      </section>

      {error && <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">{error}</div>}

      {cargando ? (
        <div className="y-panel" style={{ padding: 24, textAlign: 'center' }}>Cargando…</div>
      ) : tab === 'ventas' ? (
        <TablaReporte
          columnas={['Fecha', 'Tipo doc', 'Comprobantes', 'Subtotal', 'IGV', 'Total']}
          filas={ventasFiltradas.map((v) => [v.fecha, tipoDocumento(v.tipodocumento), v.comprobantes, fmt(v.subtotal), fmt(v.igv), fmt(v.total)])}
          mensajeVacio="No hay ventas que coincidan con los filtros."
          alinearDerecha={[2, 3, 4, 5]}
        />
      ) : tab === 'productos' ? (
        <TablaReporte
          columnas={['Producto', 'Categoría', 'Cantidad', 'Total']}
          filas={productosFiltrados.map((p) => [p.producto, p.categoria, p.cantidad, fmt(p.total)])}
          mensajeVacio="No hay productos que coincidan con los filtros."
          alinearDerecha={[2, 3]}
        />
      ) : tab === 'categorias' ? (
        <TablaReporte
          columnas={['Categoría', 'Productos', 'Unidades vendidas', 'Importe vendido']}
          filas={ventasCategoriaFiltradas.map((row) => [row.categoria, row.cantidadProductos, row.unidades, fmt(row.total)])}
          mensajeVacio="No hay ventas por categoría en el periodo seleccionado."
          alinearDerecha={[1, 2, 3]}
        />
      ) : tab === 'pagos' ? (
        <TablaReporte
          columnas={['Fecha', 'Medio', 'Responsable', 'Comprobantes', 'Operaciones', 'Total cobrado', 'Efectivo físico']}
          filas={pagosFiltrados.map((p) => [p.fecha, p.metodoPago, p.usuario, p.comprobantes, p.operaciones, fmt(p.total), p.efectivoFisico ? 'Sí' : 'No'])}
          mensajeVacio="No hay pagos que coincidan con los filtros."
          alinearDerecha={[3, 4, 5]}
        />
      ) : tab === 'comprobantes' ? (
        <TablaReporte
          columnas={['Fecha', 'Comprobante', 'Caja / turno', 'Responsable', 'Total']}
          filas={comprobantesFiltrados.map((c) => [new Date(c.fecha).toLocaleString('es-PE'), `${tipoDocumento(c.tipoDocumento)} ${c.serie}-${c.numero}`, `${c.caja} / ${c.turno}`, c.usuario, fmt(c.total)])}
          mensajeVacio="No hay comprobantes que coincidan con los filtros."
          alinearDerecha={[4]}
        />
      ) : tab === 'movimientos' ? (
        <TablaReporte
          columnas={['Fecha', 'Caja / turno', 'Tipo / concepto', 'Medio', 'Detalle', 'Responsable', 'Monto']}
          filas={movimientosFiltrados.map((m) => [new Date(m.fecha).toLocaleString('es-PE'), `${m.caja} / ${m.turno}`, `${m.tipoMovimiento} · ${m.concepto}`, m.metodoPago, `${m.descripcion ?? ''}${m.banco ? ` · ${m.banco}` : ''}${m.referencia ? ` · ${m.referencia}` : ''}`, m.usuario, fmt(m.monto)])}
          mensajeVacio="No hay movimientos que coincidan con los filtros."
          alinearDerecha={[6]}
        />
      ) : tab === 'reservas' ? (
        <TablaReporte
          columnas={['Fecha y hora', 'Cliente', 'Mesa', 'Personas', 'Adelanto', 'Estado', 'Responsable', 'Observación']}
          filas={reservasFiltradas.map((row) => [new Date(row.fecha).toLocaleString('es-PE'), row.cliente, row.mesa, row.personas, fmt(row.adelanto), etiquetaEstadoReserva(row.estado), row.responsable, row.observacion ?? '—'])}
          mensajeVacio="No hay reservas que coincidan con los filtros."
          alinearDerecha={[3, 4]}
        />
      ) : tab === 'delivery' ? (
        <TablaReporte
          columnas={['Pedido', 'Distrito', 'Repartidor', 'Estado', 'Costo envío', 'Creado', 'Salida', 'Entrega']}
          filas={deliveryFiltrado.map((row) => [row.pedido, row.distrito, row.repartidor, row.estado, fmt(row.costoEnvio), formatoFecha(row.fechaCreacion), formatoFecha(row.fechaSalida), formatoFecha(row.fechaEntrega)])}
          mensajeVacio="No hay deliveries que coincidan con los filtros."
          alinearDerecha={[4]}
        />
      ) : tablaConfig ? (
        <TablaReporte {...tablaConfig} />
      ) : (
        <TablaReporte
          columnas={['Caja', 'Turno', 'Apertura', 'Cierre', 'Inicial', 'Ingresos', 'Egresos', 'Sistema', 'Declarado', 'Diferencia', 'Estado']}
          filas={arqueoFiltrado.map((a) => [a.caja, a.numeroTurno, new Date(a.fechaApertura).toLocaleString(), a.fechaCierre ? new Date(a.fechaCierre).toLocaleString() : '—', fmt(a.montoInicial), fmt(a.totalIngresos), fmt(a.totalEgresos), fmt(a.montoSistema), fmt(a.montoDeclarado), fmt(a.diferencia), a.situacion === 'C' ? 'Cerrado' : 'Abierto'])}
          mensajeVacio="No hay arqueos que coincidan con los filtros."
          alinearDerecha={[4, 5, 6, 7, 8, 9]}
        />
      )}

    </div>
  );
}
