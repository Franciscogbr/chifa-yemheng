import { supabase } from '../config/supabase.js';
import type { KardexQuery } from '../schemas/kardex.schema.js';

interface KardexRow {
  id_movimientoinv: number;
  id_producto: number;
  producto: { n_producto: string; clasificacion: string | null; categoria_producto: { n_categoriaproducto: string } | null; unidad_medida: { n_unidad: string } | null } | null;
  tipo_movimiento: string;
  cantidad: number;
  stock_anterior: number;
  stock_nuevo: number;
  costo_unitario: number;
  documento: string | null;
  observacion: string | null;
  f_movimiento: string;
  id_usuario: number | null;
  usuario: { logeo: string } | null;
}

const KARDEX_SELECT = `
  id_movimientoinv,
  id_producto,
  producto!inner(n_producto, categoria_producto(n_categoriaproducto), unidad_medida(n_unidad)),
  tipo_movimiento,
  cantidad,
  stock_anterior,
  stock_nuevo,
  costo_unitario,
  documento,
  observacion,
  f_movimiento,
  id_usuario,
  usuario(logeo)
`;

const CLASIFICACION_SELECT = 'id_producto, clasificacion';

export async function listarKardex(q: KardexQuery): Promise<{
  data: KardexRow[];
  page: number;
  limit: number;
  total: number;
}> {
  const desde = (q.page - 1) * q.limit;
  const hasta = desde + q.limit - 1;

  let query = supabase
    .from('movimiento_inventario')
    .select(KARDEX_SELECT, { count: 'exact' })
    .eq('estado', 'A')
    .eq('producto.tipo_producto', 'I')
    .order('f_movimiento', { ascending: false })
    .order('id_movimientoinv', { ascending: false })
    .range(desde, hasta);

  if (q.productoId) query = query.eq('id_producto', q.productoId);
  if (q.nombre) query = query.ilike('producto.n_producto', `%${q.nombre}%`);
  if (q.categoriaId) query = query.eq('producto.id_categoriaproducto', q.categoriaId);
  if (q.tipo) query = query.eq('tipo_movimiento', q.tipo);
  if (q.desde) query = query.gte('f_movimiento', `${q.desde}T00:00:00`);
  if (q.hasta) {
    const hastaExclusivo = new Date(`${q.hasta}T00:00:00.000Z`);
    hastaExclusivo.setUTCDate(hastaExclusivo.getUTCDate() + 1);
    query = query.lt('f_movimiento', `${hastaExclusivo.toISOString().slice(0, 10)}T00:00:00`);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(`DB_LIST_FAIL: ${error.message}`);

  const rows = ((data ?? []) as unknown as KardexRow[]);

  // Resolver clasificaciones por separado para evitar problemas de cache de schema en el JOIN anidado
  const productoIds = [...new Set(rows.map((r) => r.id_producto))];
  let clasificaciones: Record<number, string | null> = {};
  if (productoIds.length > 0) {
    const { data: clasData } = await supabase
      .from('producto')
      .select(CLASIFICACION_SELECT)
      .in('id_producto', productoIds);
    if (clasData) {
      for (const c of (clasData as unknown as { id_producto: number; clasificacion: string | null }[])) {
        clasificaciones[c.id_producto] = c.clasificacion;
      }
    }
  }

  // Aplicar filtro de clasificación si se solicitó
  let filtradas = rows;
  if (q.clasificacion) {
    filtradas = rows.filter((r) => {
      const c = clasificaciones[r.id_producto] ?? r.producto?.clasificacion ?? null;
      return c === q.clasificacion;
    });
  }

  // Enriquecer cada fila con la clasificación resuelta
  const enriquecidas = filtradas.map((r) => ({
    ...r,
    producto: r.producto
      ? {
          ...r.producto,
          clasificacion: clasificaciones[r.id_producto] ?? r.producto.clasificacion,
        }
      : null,
  }));

  return {
    data: enriquecidas,
    page: q.page,
    limit: q.limit,
    total: q.clasificacion ? filtradas.length : (count ?? 0),
  };
}
