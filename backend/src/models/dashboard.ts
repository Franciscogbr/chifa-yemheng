/** Tipos del panel (dashboard.md, solo lectura). Sin hardcode: vacíos reales. */
export interface VentasHoy {
  total: number;
  comandas: number;
}

export interface PedidosResumen {
  activos: number;
  abiertos: number;
  cocina: number;
  porCobrar: number;
}

export interface MesasResumen {
  ocupadas: number;
  total: number;
}

export interface ActividadItem {
  texto: string;
  detalle: string;
  hace: string;
  icono: string;
  tono: 'ok' | 'cocina' | 'reserva' | 'alerta' | 'caja';
}

export interface VentaReciente {
  comprobante: string;
  cliente: string;
  fecha: string;
  total: number;
  estado: string;
}

export interface StockItem {
  producto: string;
  actual: string;
  minimo: string;
}

export interface PuntoDia {
  dia: string;
  total: number;
}

export interface DonaItem {
  nombre: string;
  pct: number;
  color: string;
}

export interface DashboardResumen {
  ventasHoy: VentasHoy;
  pedidos: PedidosResumen;
  mesas: MesasResumen;
  reservasPendientes: number;
  actividad: ActividadItem[];
  ultimasVentas: VentaReciente[];
  stockBajo: StockItem[];
  ventasDia: PuntoDia[];
  donaPlatos: DonaItem[];
}
