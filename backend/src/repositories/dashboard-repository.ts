import { supabase } from '../config/supabase.js';
import type {
  ActividadItem,
  DashboardResumen,
  DonaItem,
  MesasResumen,
  PedidosResumen,
  PuntoDia,
  StockItem,
  VentaReciente,
  VentasHoy,
} from '../models/dashboard.js';

/* Sin hardcode: en vacío/error se devuelve 0/[] y el front muestra estado vacío. */

function haceRelativo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.max(1, Math.round(ms / 60000));
  if (min < 60) {
    return `hace ${min} min`;
  }
  const h = Math.round(min / 60);
  if (h < 24) {
    return `hace ${h} hora${h > 1 ? 's' : ''}`;
  }
  return `hace ${Math.round(h / 24)} día(s)`;
}

async function ventasHoy(): Promise<VentasHoy> {
  try {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    const { data, error } = await supabase
      .from('venta')
      .select('total')
      .gte('f_venta', inicio.toISOString())
      .eq('anulada', 'N');
    if (error || !data) {
      return { total: 0, comandas: 0 };
    }
    const rows = data as { total: number }[];
    return {
      total: rows.reduce((acc, r) => acc + Number(r.total ?? 0), 0),
      comandas: rows.length,
    };
  } catch {
    return { total: 0, comandas: 0 };
  }
}

async function pedidos(): Promise<PedidosResumen> {
  try {
    const [peds, catalogo] = await Promise.all([
      supabase.from('pedido').select('id_estadopedido').eq('anulada', 'N'),
      supabase.from('estado_pedido').select('id_estadopedido, descripcion'),
    ]);
    if (peds.error || catalogo.error || !peds.data || !catalogo.data) {
      return { activos: 0, abiertos: 0, cocina: 0, porCobrar: 0 };
    }
    // SERVIDO = servido en espera de cuenta (POR COBRAR no tiene columna propia).
    const mapa = new Map(
      (catalogo.data as { id_estadopedido: number; descripcion: string }[]).map((e) => [
        e.id_estadopedido,
        e.descripcion.toUpperCase().replace(/\s+/g, '_'),
      ]),
    );
    let abiertos = 0;
    let cocina = 0;
    let porCobrar = 0;
    for (const r of peds.data as { id_estadopedido: number }[]) {
      const e = mapa.get(r.id_estadopedido) ?? '';
      if (e.includes('ABIERTO')) {
        abiertos += 1;
      } else if (e.includes('PREPARACION')) {
        cocina += 1;
      } else if (e.includes('SERVIDO')) {
        porCobrar += 1;
      }
    }
    return { activos: abiertos + cocina + porCobrar, abiertos, cocina, porCobrar };
  } catch {
    return { activos: 0, abiertos: 0, cocina: 0, porCobrar: 0 };
  }
}

async function mesas(): Promise<MesasResumen> {
  try {
    const { data, error } = await supabase
      .from('mesa')
      .select('id_mesa, estado, estado_mesa(descripcion)');
    if (error || !data) {
      return { ocupadas: 0, total: 0 };
    }
    const rows = data as unknown as {
      id_mesa: number;
      estado: string;
      estado_mesa: { descripcion: string } | null;
    }[];
    const activas = rows.filter((r) => r.estado === 'A');
    const ocupadas = activas.filter((r) => {
      const d = (r.estado_mesa?.descripcion ?? '').toUpperCase();
      return d !== 'LIBRE';
    }).length;
    return { ocupadas, total: activas.length };
  } catch {
    return { ocupadas: 0, total: 0 };
  }
}

async function reservasPendientes(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('reserva')
      .select('id_reserva', { count: 'exact', head: true })
      .eq('situacion', 'P');
    if (error) {
      return 0;
    }
    return count ?? 0;
  } catch {
    return 0;
  }
}

async function actividad(): Promise<ActividadItem[]> {
  try {
    const { data, error } = await supabase
      .from('auditoria')
      .select('accion, valor_nuevo, f_evento')
      .order('id_auditoria', { ascending: false })
      .limit(5);
    if (error || !data) {
      return [];
    }
    const rows = data as { accion: string; valor_nuevo: string | null; f_evento: string }[];
    return rows.map((r) => ({
      texto: r.accion,
      detalle: r.valor_nuevo ?? '',
      hace: haceRelativo(r.f_evento),
      icono: 'history',
      tono: 'caja' as ActividadItem['tono'],
    }));
  } catch {
    return [];
  }
}

async function ultimasVentas(): Promise<VentaReciente[]> {
  try {
    const { data, error } = await supabase
      .from('venta')
      .select('id_venta, total, f_venta, anulada')
      .order('id_venta', { ascending: false })
      .limit(5);
    if (error || !data) {
      return [];
    }
    const rows = data as { id_venta: number; total: number; f_venta: string; anulada: string }[];
    return rows.map((r) => ({
      comprobante: `V-${r.id_venta}`,
      cliente: '—',
      fecha: new Date(r.f_venta).toLocaleString('es-PE'),
      total: Number(r.total ?? 0),
      estado: r.anulada === 'S' ? 'Cancelada' : 'Completada',
    }));
  } catch {
    return [];
  }
}

async function stockBajo(): Promise<StockItem[]> {
  try {
    const { data, error } = await supabase
      .from('producto')
      .select('n_producto, stock_actual, stock_minimo')
      .eq('controla_stock', 'S')
      .eq('estado', 'A')
      .limit(50);
    if (error || !data) {
      return [];
    }
    const rows = data as { n_producto: string; stock_actual: number; stock_minimo: number }[];
    return rows
      .filter((r) => Number(r.stock_actual ?? 0) <= Number(r.stock_minimo ?? 0))
      .slice(0, 5)
      .map((r) => ({
        producto: r.n_producto,
        actual: `${r.stock_actual}`,
        minimo: `Mín: ${r.stock_minimo}`,
      }));
  } catch {
    return [];
  }
}

/** Ventas por día últimos 14 días (incluye hoy). Días sin venta van en 0. */
async function ventasPorDia(): Promise<PuntoDia[]> {
  const dias = 14;
  const out: PuntoDia[] = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const claves: string[] = [];
  for (let i = dias - 1; i >= 0; i -= 1) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    claves.push(key);
    out.push({
      dia: d.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' }),
      total: 0,
    });
  }
  try {
    const desde = new Date(base);
    desde.setDate(base.getDate() - (dias - 1));
    const { data, error } = await supabase
      .from('venta')
      .select('total, f_venta')
      .gte('f_venta', desde.toISOString())
      .eq('anulada', 'N');
    if (error || !data) {
      return out;
    }
    const acc = new Map<string, number>();
    for (const r of data as { total: number; f_venta: string }[]) {
      const d = new Date(r.f_venta);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      acc.set(key, (acc.get(key) ?? 0) + Number(r.total ?? 0));
    }
    return out.map((p, i) => ({ ...p, total: Math.round(acc.get(claves[i] ?? '') ?? 0) }));
  } catch {
    return out;
  }
}

async function donaPlatos(): Promise<DonaItem[]> {
  // Real: top 5 platos últimos 30d por cantidad vendida. Vacío si no hay datos.
  try {
    const desde = new Date();
    desde.setDate(desde.getDate() - 30);
    const { data: det, error: detError } = await supabase
      .from('detalle_pedido')
      .select('cantidad, id_producto, f_solicitud')
      .eq('estado', 'A')
      .gte('f_solicitud', desde.toISOString())
      .limit(2000);
    if (detError || !det || (det as unknown[]).length === 0) {
      return [];
    }
    const rows = det as { cantidad: number; id_producto: number }[];
    const acc = new Map<number, number>();
    for (const r of rows) {
      acc.set(r.id_producto, (acc.get(r.id_producto) ?? 0) + Number(r.cantidad ?? 0));
    }
    const top = [...acc.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (top.length === 0) {
      return [];
    }
    const { data: prods, error: prodError } = await supabase
      .from('producto')
      .select('id_producto, n_producto')
      .in('id_producto', top.map(([id]) => id));
    if (prodError || !prods) {
      return [];
    }
    const nombres = new Map(
      (prods as { id_producto: number; n_producto: string }[]).map((p) => [p.id_producto, p.n_producto]),
    );
    const totalTop = top.reduce((s, [, c]) => s + c, 0) || 1;
    const colores = ['#83000f', '#795900', '#7c1316', '#ffc641', '#5a413e'];
    return top.map(([id, cant], i) => ({
      nombre: nombres.get(id) ?? `Producto ${id}`,
      pct: Math.round((cant / totalTop) * 100),
      color: colores[i % colores.length] ?? '#5a413e',
    }));
  } catch {
    return [];
  }
}

export async function resumenDashboard(): Promise<DashboardResumen> {
  const [ventasHoyR, pedidosR, mesasR, reservasR, actividadR, ventasR, stockR, diaR, donaR] =
    await Promise.all([
      ventasHoy(),
      pedidos(),
      mesas(),
      reservasPendientes(),
      actividad(),
      ultimasVentas(),
      stockBajo(),
      ventasPorDia(),
      donaPlatos(),
    ]);
  return {
    ventasHoy: ventasHoyR,
    pedidos: pedidosR,
    mesas: mesasR,
    reservasPendientes: reservasR,
    actividad: actividadR,
    ultimasVentas: ventasR,
    stockBajo: stockR,
    ventasDia: diaR,
    donaPlatos: donaR,
  };
}
