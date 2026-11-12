import { useEffect, useState, type CSSProperties } from 'react';
import { leerToken } from '../../auth/login/auth-service';
import { exportarReportesExcel, exportarReportesPdf, type ReporteExportable } from './reportes-export';

import { API_URL } from '../../../lib/api-url';

const BASE = `${API_URL}/reportes`;

type ReportTab = 'ventas' | 'productos' | 'categorias' | 'arqueo' | 'pagos' | 'comprobantes' | 'movimientos' | 'reservas' | 'delivery' | 'canales' | 'horarios' | 'ticket' | 'anulaciones' | 'notas-credito' | 'clientes' | 'mesas' | 'empleados' | 'fiscal' | 'ventas-anuladas' | 'sunat' | 'pagos-operacion' | 'reservas-estado' | 'tipo-cliente' | 'comparacion' | 'caja-resumen';
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

function TablaReporte({
  columnas,
  filas,
  mensajeVacio,
  nota,
}: {
  columnas: string[];
  filas: (string | number)[][];
  mensajeVacio: string;
  nota?: string;
}) {
  return (
    <div className="overflow-x-auto">
      {nota && <p className="mb-3 text-xs text-[#333]/60">{nota}</p>}
      <table className="w-full text-sm">
        <thead><tr className="bg-[#F5F5F5] text-left text-xs uppercase tracking-wider text-[#333]/60">
          {columnas.map((columna) => <th key={columna} className="px-3 py-2">{columna}</th>)}
        </tr></thead>
        <tbody className="divide-y divide-[#F5F5F5]">
          {filas.map((fila, index) => <tr key={index} className="hover:bg-[#F5F5F5]">
            {fila.map((celda, celdaIndex) => <td key={celdaIndex} className="px-3 py-2">{celda}</td>)}
          </tr>)}
        </tbody>
      </table>
      {filas.length === 0 && <p className="py-4 text-center text-sm text-[#333]/60">{mensajeVacio}</p>}
    </div>
  );
}

async function fetchReporte<T>(path: string, params: Record<string, string>): Promise<T> {
  const q = new URLSearchParams(params);
  const res = await fetch(`${BASE}/${path}?${q.toString()}`, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${leerToken() ?? ''}` } });
  if (!res.ok) throw new Error('NETWORK_ERROR');
  return res.json();
}

export function AdminReportesPage() {
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
  const [tab, setTab] = useState<ReportTab>('ventas');

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

  const fmt = (n: number) => `S/. ${n.toFixed(2)}`;
  const formatoFecha = (fecha: string | null) => fecha
    ? new Date(fecha).toLocaleString('es-PE')
    : 'Sin cierre';
  const tipoDocumento = (tipo: string) => tipo === '03' ? 'Boleta' : tipo === '01' ? 'Factura' : tipo;
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
    filas: (string | number)[][];
    mensajeVacio: string;
    nota?: string;
  }>> = {
    mesas: {
      columnas: ['Ambiente', 'Mesa', 'Comprobantes', 'Total vendido'],
      filas: ventasPorMesaFiltradas.map((row) => [row.ambiente, row.mesa, row.comprobantes, fmt(row.total)]),
      mensajeVacio: 'No hay ventas asociadas a mesas en el periodo.',
    },
    empleados: {
      columnas: ['Empleado asignado al pedido', 'Comprobantes', 'Total vendido'],
      filas: ventasPorEmpleadoFiltradas.map((row) => [row.empleado, row.comprobantes, fmt(row.total)]),
      mensajeVacio: 'No hay ventas con empleado asignado en el periodo.',
      nota: 'La atribución corresponde al empleado asociado al pedido; no identifica necesariamente quién realizó cada acción.',
    },
    fiscal: {
      columnas: ['Fecha', 'Comprobantes', 'Subtotal', 'Descuento', 'Servicio', 'IGV', 'Total'],
      filas: desgloseFiscalFiltrado.map((row) => [row.fecha, row.comprobantes, fmt(row.subtotal), fmt(row.descuento), fmt(row.servicio), fmt(row.igv), fmt(row.total)]),
      mensajeVacio: 'No hay ventas para desglosar en el periodo.',
    },
    'ventas-anuladas': {
      columnas: ['Venta', 'Fecha de venta', 'Documento', 'Responsable registrado', 'Total', 'Motivo'],
      filas: ventasAnuladasFiltradas.map((row) => [row.id, formatoFecha(row.fechaVenta), tipoDocumento(row.tipoDocumento), row.responsable, fmt(row.total), row.motivo ?? 'Sin motivo registrado']),
      mensajeVacio: 'No hay ventas anuladas en el periodo.',
      nota: 'La fecha corresponde a la venta; el sistema no registra una fecha independiente de anulación.',
    },
    sunat: {
      columnas: ['Venta', 'Documento', 'Fecha', 'Total', 'Estado SUNAT registrado'],
      filas: estadoSunatFiltrado.map((row) => [row.ventaId, `${row.tipoDocumento} ${row.serie}-${row.numero}`, formatoFecha(row.fecha), fmt(row.total), row.estadoRegistrado]),
      mensajeVacio: 'No hay comprobantes fiscales en el periodo.',
      nota: 'El estado mostrado es el valor guardado localmente; no es una consulta en tiempo real a SUNAT.',
    },
    'pagos-operacion': {
      columnas: ['Pago', 'Venta', 'Fecha de pago', 'Documento', 'Medio', 'Monto', 'Referencia'],
      filas: pagosPorOperacionFiltrados.map((row) => [row.id, row.ventaId, formatoFecha(row.fechaPago), tipoDocumento(row.tipoDocumento), row.metodoPago, fmt(row.monto), row.referencia ?? '—']),
      mensajeVacio: 'No hay operaciones de pago en el periodo.',
      nota: 'Cada fila es una operación individual; en pagos mixtos una venta puede aparecer en varias filas.',
    },
    'reservas-estado': {
      columnas: ['Estado registrado', 'Cantidad'],
      filas: analisisComercial.reservasPorEstado.map((row) => [etiquetaEstadoReserva(row.estado), row.cantidad]),
      mensajeVacio: 'No hay reservas en el periodo.',
    },
    'tipo-cliente': {
      columnas: ['Tipo de cliente', 'Comprobantes', 'Total vendido'],
      filas: ventasPorTipoClienteFiltradas.map((row) => [row.tipo, row.comprobantes, fmt(row.total)]),
      mensajeVacio: 'No hay ventas por tipo de cliente en el periodo.',
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
    },
  };

  return (
    <div className="y-shell" style={{ padding: '24px 16px 140px', maxWidth: 1240, margin: '0 auto' }}>
      <header className="y-panel" style={{ padding: 22, marginBottom: 16 }}>
        <p style={{ margin: '0 0 4px', color: 'var(--accent)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
          Control del negocio
        </p>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--fg)', margin: '0 0 6px' }}>Reportes del sistema</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          Elige el periodo y combina filtros para consultar el detalle que necesitas. Cada pestaña se puede exportar por separado.
        </p>
      </header>

      <section className="y-panel" style={{ padding: 16, marginBottom: 16 }}>
        <div className="flex flex-wrap items-end gap-3">
          <label style={{ display: 'grid', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
            Desde
            <input aria-label="Fecha desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm" />
          </label>
          <label style={{ display: 'grid', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
            Hasta
            <input aria-label="Fecha hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm" />
          </label>
        </div>
        <p style={{ margin: '10px 0 0', color: 'var(--text-muted)', fontSize: 12 }}>
          Periodo aplicado: <b>{periodo}</b>.
        </p>
      </section>

      <section
        aria-label="Resumen del periodo"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}
      >
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

      <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label="Secciones de reportes">
          {(['ventas', 'productos', 'categorias', 'arqueo', 'pagos', 'comprobantes', 'movimientos', 'reservas', 'delivery', 'canales', 'horarios', 'ticket', 'anulaciones', 'notas-credito', 'clientes', 'mesas', 'empleados', 'fiscal', 'ventas-anuladas', 'sunat', 'pagos-operacion', 'reservas-estado', 'tipo-cliente', 'comparacion', 'caja-resumen'] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${tab === t ? 'bg-[#A61E22] text-white' : 'bg-[#F5F5F5] hover:bg-[#D9D9D9]'}`}>
              {t === 'ventas' ? 'Ventas' : t === 'productos' ? 'Productos más vendidos' : t === 'categorias' ? 'Ventas por categoría' : t === 'arqueo' ? 'Arqueos de caja' : t === 'pagos' ? 'Pagos por medio' : t === 'comprobantes' ? 'Comprobantes' : t === 'movimientos' ? 'Movimientos' : t === 'reservas' ? 'Reservas' : t === 'delivery' ? 'Delivery' : t === 'canales' ? 'Canales y pedidos' : t === 'horarios' ? 'Días y horarios' : t === 'ticket' ? 'Ticket promedio' : t === 'anulaciones' ? 'Pedidos anulados' : t === 'notas-credito' ? 'Notas de crédito' : t === 'clientes' ? 'Clientes frecuentes' : t === 'mesas' ? 'Ventas por mesa' : t === 'empleados' ? 'Ventas por empleado' : t === 'fiscal' ? 'Desglose fiscal' : t === 'ventas-anuladas' ? 'Ventas anuladas' : t === 'sunat' ? 'SUNAT registrado' : t === 'pagos-operacion' ? 'Pagos por operación' : t === 'reservas-estado' ? 'Reservas por estado' : t === 'tipo-cliente' ? 'Tipo de cliente' : t === 'comparacion' ? 'Comparación de periodos' : 'Resumen de caja'}
            </button>
          ))}
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
            <button type="button" className="rounded-lg border border-[#A61E22] px-4 py-2 text-sm font-semibold text-[#A61E22] hover:bg-[#A61E22]/5 disabled:opacity-50" disabled={cargando || exportando} onClick={() => void exportar('pdf')}>
              {exportando ? 'Preparando…' : `Descargar PDF de ${reporteActivo?.title}`}
            </button>
            <button type="button" className="rounded-lg bg-[#A61E22] px-4 py-2 text-sm font-semibold text-white hover:bg-[#84171B] disabled:opacity-50" disabled={cargando || exportando} onClick={() => void exportar('excel')}>
              {exportando ? 'Preparando…' : `Descargar Excel de ${reporteActivo?.title}`}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10, marginTop: 16 }}>
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
          <button type="button" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" onClick={() => {
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
        <div className="y-panel" style={{ padding: 24, textAlign: 'center' }}>Cargando...</div>
      ) : tablasAdicionales[tab] ? (
        <TablaReporte {...tablasAdicionales[tab]!} />
      ) : tab === 'ventas' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F5F5F5] text-left text-xs uppercase tracking-wider text-[#333]/60">
                <th className="px-3 py-2">Fecha</th>
                <th className="px-3 py-2">Tipo doc</th>
                <th className="px-3 py-2 text-right">Comprobantes</th>
                <th className="px-3 py-2 text-right">Subtotal</th>
                <th className="px-3 py-2 text-right">IGV</th>
                <th className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F5]">
              {ventasFiltradas.map((v, i) => (
                <tr key={i} className="hover:bg-[#F5F5F5]">
                  <td className="px-3 py-2">{v.fecha}</td>
                  <td className="px-3 py-2">{tipoDocumento(v.tipodocumento)}</td>
                  <td className="px-3 py-2 text-right">{v.comprobantes}</td>
                  <td className="px-3 py-2 text-right">{fmt(v.subtotal)}</td>
                  <td className="px-3 py-2 text-right">{fmt(v.igv)}</td>
                  <td className="px-3 py-2 text-right font-bold">{fmt(v.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {ventasFiltradas.length === 0 && <p className="text-center py-4 text-sm text-[#333]/60">No hay ventas que coincidan con los filtros.</p>}
        </div>
      ) : tab === 'productos' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F5F5F5] text-left text-xs uppercase tracking-wider text-[#333]/60">
                <th className="px-3 py-2">Producto</th>
                <th className="px-3 py-2">Categoría</th>
                <th className="px-3 py-2 text-right">Cantidad</th>
                <th className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F5]">
              {productosFiltrados.map((p, i) => (
                <tr key={i} className="hover:bg-[#F5F5F5]">
                  <td className="px-3 py-2">{p.producto}</td>
                  <td className="px-3 py-2">{p.categoria}</td>
                  <td className="px-3 py-2 text-right">{p.cantidad}</td>
                  <td className="px-3 py-2 text-right font-bold">{fmt(p.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {productosFiltrados.length === 0 && <p className="text-center py-4 text-sm text-[#333]/60">No hay productos que coincidan con los filtros.</p>}
        </div>
      ) : tab === 'categorias' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F5] text-left text-xs uppercase tracking-wider text-[#333]/60">
              <th className="px-3 py-2">Categoría</th><th className="px-3 py-2 text-right">Productos</th>
              <th className="px-3 py-2 text-right">Unidades vendidas</th><th className="px-3 py-2 text-right">Importe vendido</th>
            </tr></thead>
            <tbody className="divide-y divide-[#F5F5F5]">{ventasCategoriaFiltradas.map((row) => <tr key={row.categoriaId ?? 'sin-categoria'}>
              <td className="px-3 py-2">{row.categoria}</td><td className="px-3 py-2 text-right">{row.cantidadProductos}</td>
              <td className="px-3 py-2 text-right">{row.unidades}</td><td className="px-3 py-2 text-right font-bold">{fmt(row.total)}</td>
            </tr>)}</tbody>
          </table>
          {ventasCategoriaFiltradas.length === 0 && <p className="text-center py-4 text-sm text-[#333]/60">No hay ventas por categoría en el periodo seleccionado.</p>}
        </div>
      ) : tab === 'pagos' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F5] text-left text-xs uppercase tracking-wider text-[#333]/60">
              <th className="px-3 py-2">Fecha</th><th className="px-3 py-2">Medio</th><th className="px-3 py-2">Responsable</th>
              <th className="px-3 py-2 text-right">Comprobantes</th><th className="px-3 py-2 text-right">Operaciones</th>
              <th className="px-3 py-2 text-right">Total cobrado</th><th className="px-3 py-2">Efectivo físico</th>
            </tr></thead>
            <tbody className="divide-y divide-[#F5F5F5]">{pagosFiltrados.map((p, i) => <tr key={`${p.fecha}-${p.metodoPagoId}-${p.usuarioId}-${i}`}>
              <td className="px-3 py-2">{p.fecha}</td><td className="px-3 py-2">{p.metodoPago}</td><td className="px-3 py-2">{p.usuario}</td>
              <td className="px-3 py-2 text-right">{p.comprobantes}</td><td className="px-3 py-2 text-right">{p.operaciones}</td>
              <td className="px-3 py-2 text-right font-bold">{fmt(p.total)}</td><td className="px-3 py-2">{p.efectivoFisico ? 'Sí' : 'No'}</td>
            </tr>)}</tbody>
          </table>
          {pagosFiltrados.length === 0 && <p className="text-center py-4 text-sm text-[#333]/60">No hay pagos que coincidan con los filtros.</p>}
        </div>
      ) : tab === 'comprobantes' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F5] text-left text-xs uppercase tracking-wider text-[#333]/60">
              <th className="px-3 py-2">Fecha</th><th className="px-3 py-2">Comprobante</th><th className="px-3 py-2">Caja / turno</th>
              <th className="px-3 py-2">Responsable</th><th className="px-3 py-2 text-right">Total</th>
            </tr></thead>
            <tbody className="divide-y divide-[#F5F5F5]">{comprobantesFiltrados.map((c) => <tr key={c.ventaId}>
              <td className="px-3 py-2">{new Date(c.fecha).toLocaleString('es-PE')}</td>
              <td className="px-3 py-2">{tipoDocumento(c.tipoDocumento)} {c.serie}-{c.numero}</td>
              <td className="px-3 py-2">{c.caja} / {c.turno}</td><td className="px-3 py-2">{c.usuario}</td>
              <td className="px-3 py-2 text-right font-bold">{fmt(c.total)}</td>
            </tr>)}</tbody>
          </table>
          {comprobantesFiltrados.length === 0 && <p className="text-center py-4 text-sm text-[#333]/60">No hay comprobantes que coincidan con los filtros.</p>}
        </div>
      ) : tab === 'movimientos' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F5] text-left text-xs uppercase tracking-wider text-[#333]/60">
              <th className="px-3 py-2">Fecha</th><th className="px-3 py-2">Caja / turno</th><th className="px-3 py-2">Tipo / concepto</th>
              <th className="px-3 py-2">Medio</th><th className="px-3 py-2">Detalle</th><th className="px-3 py-2">Responsable</th>
              <th className="px-3 py-2 text-right">Monto</th>
            </tr></thead>
            <tbody className="divide-y divide-[#F5F5F5]">{movimientosFiltrados.map((m) => <tr key={m.id}>
              <td className="px-3 py-2">{new Date(m.fecha).toLocaleString('es-PE')}</td><td className="px-3 py-2">{m.caja} / {m.turno}</td>
              <td className="px-3 py-2">{m.tipoMovimiento} · {m.concepto}</td><td className="px-3 py-2">{m.metodoPago}</td>
              <td className="px-3 py-2">{m.descripcion ?? ''}{m.banco ? ` · ${m.banco}` : ''}{m.referencia ? ` · ${m.referencia}` : ''}</td>
              <td className="px-3 py-2">{m.usuario}</td><td className="px-3 py-2 text-right font-bold">{fmt(m.monto)}</td>
            </tr>)}</tbody>
          </table>
          {movimientosFiltrados.length === 0 && <p className="text-center py-4 text-sm text-[#333]/60">No hay movimientos que coincidan con los filtros.</p>}
        </div>
      ) : tab === 'reservas' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F5] text-left text-xs uppercase tracking-wider text-[#333]/60">
              <th className="px-3 py-2">Fecha y hora</th><th className="px-3 py-2">Cliente</th><th className="px-3 py-2">Mesa</th>
              <th className="px-3 py-2 text-right">Personas</th><th className="px-3 py-2 text-right">Adelanto</th>
              <th className="px-3 py-2">Estado</th><th className="px-3 py-2">Responsable</th><th className="px-3 py-2">Observación</th>
            </tr></thead>
            <tbody className="divide-y divide-[#F5F5F5]">{reservasFiltradas.map((row) => <tr key={row.id}>
              <td className="px-3 py-2">{new Date(row.fecha).toLocaleString('es-PE')}</td><td className="px-3 py-2">{row.cliente}</td>
              <td className="px-3 py-2">{row.mesa}</td><td className="px-3 py-2 text-right">{row.personas}</td>
              <td className="px-3 py-2 text-right font-bold">{fmt(row.adelanto)}</td>
              <td className="px-3 py-2">{etiquetaEstadoReserva(row.estado)}</td>
              <td className="px-3 py-2">{row.responsable}</td><td className="px-3 py-2">{row.observacion ?? '—'}</td>
            </tr>)}</tbody>
          </table>
          {reservasFiltradas.length === 0 && <p className="text-center py-4 text-sm text-[#333]/60">No hay reservas que coincidan con los filtros.</p>}
        </div>
      ) : tab === 'delivery' ? (
        <div className="overflow-x-auto">
          <p className="mb-3 text-xs text-[#333]/60">Los estados y marcas de tiempo se muestran tal como están registrados; no se calcula una duración de entrega.</p>
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F5] text-left text-xs uppercase tracking-wider text-[#333]/60">
              <th className="px-3 py-2">Pedido</th><th className="px-3 py-2">Distrito</th><th className="px-3 py-2">Repartidor</th>
              <th className="px-3 py-2">Estado (código)</th><th className="px-3 py-2 text-right">Costo envío</th>
              <th className="px-3 py-2">Creado</th><th className="px-3 py-2">Salida registrada</th><th className="px-3 py-2">Entrega registrada</th>
            </tr></thead>
            <tbody className="divide-y divide-[#F5F5F5]">{deliveryFiltrado.map((row) => <tr key={row.id}>
              <td className="px-3 py-2">{row.pedido}</td><td className="px-3 py-2">{row.distrito}</td><td className="px-3 py-2">{row.repartidor}</td>
              <td className="px-3 py-2">{row.estado}</td><td className="px-3 py-2 text-right">{fmt(row.costoEnvio)}</td>
              <td className="px-3 py-2">{formatoFecha(row.fechaCreacion)}</td><td className="px-3 py-2">{formatoFecha(row.fechaSalida)}</td>
              <td className="px-3 py-2">{formatoFecha(row.fechaEntrega)}</td>
            </tr>)}</tbody>
          </table>
          {deliveryFiltrado.length === 0 && <p className="text-center py-4 text-sm text-[#333]/60">No hay deliveries que coincidan con los filtros.</p>}
        </div>
      ) : tab === 'canales' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm"><thead><tr className="bg-[#F5F5F5] text-left text-xs uppercase tracking-wider text-[#333]/60">
            <th className="px-3 py-2">Canal</th><th className="px-3 py-2">Tipo de pedido</th>
            <th className="px-3 py-2 text-right">Comprobantes</th><th className="px-3 py-2 text-right">Total vendido</th>
          </tr></thead><tbody className="divide-y divide-[#F5F5F5]">{ventasCanalFiltradas.map((row) => <tr key={`${row.canal}-${row.tipoPedido}`}>
            <td className="px-3 py-2">{row.canal}</td><td className="px-3 py-2">{row.tipoPedido}</td>
            <td className="px-3 py-2 text-right">{row.comprobantes}</td><td className="px-3 py-2 text-right font-bold">{fmt(row.total)}</td>
          </tr>)}</tbody></table>
          {ventasCanalFiltradas.length === 0 && <p className="text-center py-4 text-sm text-[#333]/60">No hay ventas para este periodo.</p>}
        </div>
      ) : tab === 'horarios' ? (
        <div className="overflow-x-auto">
          <p className="mb-3 text-xs text-[#333]/60">Agrupa ventas registradas por día de semana y hora. No es una proyección de demanda.</p>
          <table className="w-full text-sm"><thead><tr className="bg-[#F5F5F5] text-left text-xs uppercase tracking-wider text-[#333]/60">
            <th className="px-3 py-2">Día</th><th className="px-3 py-2">Hora</th>
            <th className="px-3 py-2 text-right">Comprobantes</th><th className="px-3 py-2 text-right">Total vendido</th>
          </tr></thead><tbody className="divide-y divide-[#F5F5F5]">{ventasHorarioFiltradas.map((row) => <tr key={`${row.diaSemana}-${row.hora}`}>
            <td className="px-3 py-2 capitalize">{row.diaSemana}</td><td className="px-3 py-2">{row.hora}</td>
            <td className="px-3 py-2 text-right">{row.comprobantes}</td><td className="px-3 py-2 text-right font-bold">{fmt(row.total)}</td>
          </tr>)}</tbody></table>
          {ventasHorarioFiltradas.length === 0 && <p className="text-center py-4 text-sm text-[#333]/60">No hay ventas para este periodo.</p>}
        </div>
      ) : tab === 'ticket' ? (
        <div className="overflow-x-auto">
          <p className="mb-3 text-xs text-[#333]/60">El promedio por comensal usa el número de comensales guardado en cada pedido; puede diferir si no se registró correctamente.</p>
          <table className="w-full text-sm"><thead><tr className="bg-[#F5F5F5] text-left text-xs uppercase tracking-wider text-[#333]/60">
            <th className="px-3 py-2">Fecha</th><th className="px-3 py-2 text-right">Comprobantes</th>
            <th className="px-3 py-2 text-right">Comensales</th><th className="px-3 py-2 text-right">Total vendido</th>
            <th className="px-3 py-2 text-right">Ticket promedio</th><th className="px-3 py-2 text-right">Venta por comensal</th>
          </tr></thead><tbody className="divide-y divide-[#F5F5F5]">{ticketsFiltrados.map((row) => <tr key={row.fecha}>
            <td className="px-3 py-2">{row.fecha}</td><td className="px-3 py-2 text-right">{row.comprobantes}</td>
            <td className="px-3 py-2 text-right">{row.comensales}</td><td className="px-3 py-2 text-right">{fmt(row.total)}</td>
            <td className="px-3 py-2 text-right font-bold">{fmt(row.ticketPromedio)}</td>
            <td className="px-3 py-2 text-right">{row.ticketPorComensal === null ? '—' : fmt(row.ticketPorComensal)}</td>
          </tr>)}</tbody></table>
          {ticketsFiltrados.length === 0 && <p className="text-center py-4 text-sm text-[#333]/60">No hay ventas para este periodo.</p>}
        </div>
      ) : tab === 'anulaciones' ? (
        <div className="overflow-x-auto">
          <p className="mb-3 text-xs text-[#333]/60">Lista pedidos marcados como anulados. El motivo se muestra únicamente cuando fue registrado.</p>
          <table className="w-full text-sm"><thead><tr className="bg-[#F5F5F5] text-left text-xs uppercase tracking-wider text-[#333]/60">
            <th className="px-3 py-2">Pedido</th><th className="px-3 py-2">Fecha del pedido</th><th className="px-3 py-2">Tipo</th>
            <th className="px-3 py-2">Responsable</th><th className="px-3 py-2 text-right">Comensales</th>
            <th className="px-3 py-2 text-right">Total</th><th className="px-3 py-2">Motivo registrado</th>
          </tr></thead><tbody className="divide-y divide-[#F5F5F5]">{pedidosAnuladosFiltrados.map((row) => <tr key={row.id}>
            <td className="px-3 py-2">{row.numero}</td><td className="px-3 py-2">{formatoFecha(row.fechaPedido)}</td>
            <td className="px-3 py-2">{row.tipo}</td><td className="px-3 py-2">{row.responsable}</td>
            <td className="px-3 py-2 text-right">{row.comensales}</td><td className="px-3 py-2 text-right">{fmt(row.total)}</td>
            <td className="px-3 py-2">{row.motivo ?? 'Sin motivo registrado'}</td>
          </tr>)}</tbody></table>
          {pedidosAnuladosFiltrados.length === 0 && <p className="text-center py-4 text-sm text-[#333]/60">No hay pedidos anulados para este periodo.</p>}
        </div>
      ) : tab === 'notas-credito' ? (
        <div className="overflow-x-auto">
          <p className="mb-3 text-xs text-[#333]/60">El estado SUNAT es el valor registrado en el sistema; no se consulta SUNAT en tiempo real.</p>
          <table className="w-full text-sm"><thead><tr className="bg-[#F5F5F5] text-left text-xs uppercase tracking-wider text-[#333]/60">
            <th className="px-3 py-2">Fecha</th><th className="px-3 py-2">Nota</th><th className="px-3 py-2">Comprobante referenciado</th>
            <th className="px-3 py-2">Motivo</th><th className="px-3 py-2 text-right">Monto</th><th className="px-3 py-2">SUNAT registrado</th>
          </tr></thead><tbody className="divide-y divide-[#F5F5F5]">{notasCreditoFiltradas.map((row) => <tr key={row.id}>
            <td className="px-3 py-2">{formatoFecha(row.fecha)}</td><td className="px-3 py-2">{row.serie}-{row.numero}</td>
            <td className="px-3 py-2">{tipoDocumento(row.tipoDocumentoReferencia)} {row.serieReferencia}-{row.numeroReferencia}</td>
            <td className="px-3 py-2">{row.motivo}</td><td className="px-3 py-2 text-right font-bold">{fmt(row.monto)}</td>
            <td className="px-3 py-2">{row.estadoSunat ?? 'Sin estado registrado'}</td>
          </tr>)}</tbody></table>
          {notasCreditoFiltradas.length === 0 && <p className="text-center py-4 text-sm text-[#333]/60">No hay notas de crédito para este periodo.</p>}
        </div>
      ) : tab === 'clientes' ? (
        <div className="overflow-x-auto">
          <p className="mb-3 text-xs text-[#333]/60">Incluye ventas asociadas a un cliente identificado y muestra hasta los 100 con mayor importe.</p>
          <table className="w-full text-sm"><thead><tr className="bg-[#F5F5F5] text-left text-xs uppercase tracking-wider text-[#333]/60">
            <th className="px-3 py-2">Cliente</th><th className="px-3 py-2 text-right">Compras</th>
            <th className="px-3 py-2 text-right">Total comprado</th><th className="px-3 py-2 text-right">Ticket promedio</th><th className="px-3 py-2">Última compra</th>
          </tr></thead><tbody className="divide-y divide-[#F5F5F5]">{clientesFrecuentesFiltrados.map((row) => <tr key={row.clienteId}>
            <td className="px-3 py-2">{row.nombre}</td><td className="px-3 py-2 text-right">{row.compras}</td>
            <td className="px-3 py-2 text-right font-bold">{fmt(row.total)}</td><td className="px-3 py-2 text-right">{fmt(row.ticketPromedio)}</td>
            <td className="px-3 py-2">{formatoFecha(row.ultimaCompra)}</td>
          </tr>)}</tbody></table>
          {clientesFrecuentesFiltrados.length === 0 && <p className="text-center py-4 text-sm text-[#333]/60">No hay clientes con ventas registradas en este periodo.</p>}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F5F5F5] text-left text-xs uppercase tracking-wider text-[#333]/60">
                <th className="px-3 py-2">Caja</th>
                <th className="px-3 py-2">Turno</th>
                <th className="px-3 py-2">Apertura</th>
                <th className="px-3 py-2">Cierre</th>
                <th className="px-3 py-2 text-right">Inicial</th>
                <th className="px-3 py-2 text-right">Ingresos</th>
                <th className="px-3 py-2 text-right">Egresos</th>
                <th className="px-3 py-2 text-right">Sistema</th>
                <th className="px-3 py-2 text-right">Declarado</th>
                <th className="px-3 py-2 text-right">Diferencia</th>
                <th className="px-3 py-2">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F5]">
              {arqueoFiltrado.map((a, i) => (
                <tr key={i} className="hover:bg-[#F5F5F5]">
                  <td className="px-3 py-2">{a.caja}</td>
                  <td className="px-3 py-2">{a.numeroTurno}</td>
                  <td className="px-3 py-2">{new Date(a.fechaApertura).toLocaleString()}</td>
                  <td className="px-3 py-2">{a.fechaCierre ? new Date(a.fechaCierre).toLocaleString() : '—'}</td>
                  <td className="px-3 py-2 text-right">{fmt(a.montoInicial)}</td>
                  <td className="px-3 py-2 text-right">{fmt(a.totalIngresos)}</td>
                  <td className="px-3 py-2 text-right">{fmt(a.totalEgresos)}</td>
                  <td className="px-3 py-2 text-right font-bold">{fmt(a.montoSistema)}</td>
                  <td className="px-3 py-2 text-right">{fmt(a.montoDeclarado)}</td>
                  <td className="px-3 py-2 text-right">{fmt(a.diferencia)}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${a.situacion === 'C' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {a.situacion === 'C' ? 'Cerrado' : a.situacion === 'P' ? 'Pendiente' : 'Abierto'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {arqueoFiltrado.length === 0 && <p className="text-center py-4 text-sm text-[#333]/60">No hay arqueos que coincidan con los filtros.</p>}
        </div>
      )}
    </div>
  );
}
