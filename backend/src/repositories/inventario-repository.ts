import { supabase } from '../config/supabase.js';
import type { MovimientoCreate, MovimientoQuery, RecetaCreate, RecetaQuery, RecetaUpdate, StockQuery } from '../schemas/inventario.js';
import type { MovimientoInventario, MovimientoLista, Receta, StockInsumo } from '../models/inventario.js';
import { createAudit, updateAudit } from '../utils/auditoria.js';

interface MovimientoRow {
  id_movimientoinv: number;
  id_producto: number;
  producto: { n_producto: string } | null;
  tipo_movimiento: string;
  cantidad: number;
  costo_unitario: number;
  observacion: string | null;
  f_movimiento: string;
  id_usuario: number | null;
}

interface RecetaRow {
  id_receta: number;
  id_producto: number;
  producto: { n_producto: string } | null;
  id_insumo: number;
  insumo: { n_producto: string; unidad_medida: { n_unidad: string } | null } | null;
  cantidad: number;
  estado: 'A' | 'I' | 'E';
}

interface StockRow {
  id_producto: number;
  n_producto: string;
  tipo_producto: string;
  id_categoriaproducto: number | null;
  stock_actual: number;
  stock_minimo: number;
  id_unidad: number | null;
  unidad_medida: { n_unidad: string } | null;
  categoria_producto: { n_categoriaproducto: string } | null;
}

const MOV_SELECT = 'id_movimientoinv, id_producto, producto(n_producto), tipo_movimiento, cantidad, costo_unitario, observacion, f_movimiento, id_usuario';
const RECETA_SELECT = 'id_receta, id_producto, producto!fk_receta_producto(n_producto), id_insumo, insumo:producto!fk_receta_insumo(n_producto, unidad_medida(n_unidad)), cantidad, estado';

function mapMovimiento(row: MovimientoRow): MovimientoInventario {
  return {
    id: row.id_movimientoinv,
    productoId: row.id_producto,
    producto: row.producto?.n_producto ?? '',
    tipo: row.tipo_movimiento as MovimientoInventario['tipo'],
    cantidad: Number(row.cantidad ?? 0),
    costo: Number(row.costo_unitario ?? 0),
    motivo: row.observacion,
    fecha: row.f_movimiento,
    usuarioId: row.id_usuario,
  };
}

function mapReceta(row: RecetaRow): Receta {
  return {
    id: row.id_receta,
    productoId: row.id_producto,
    producto: row.producto?.n_producto ?? '',
    insumoId: row.id_insumo,
    insumo: row.insumo?.n_producto ?? '',
    cantidad: Number(row.cantidad ?? 0),
    unidad: row.insumo?.unidad_medida?.n_unidad ?? '',
    estado: row.estado ?? 'A',
  };
}

export async function listarMovimientos(q: MovimientoQuery): Promise<MovimientoLista> {
  const desde = (q.page - 1) * q.limit;
  const hasta = desde + q.limit - 1;

  let query = supabase
    .from('movimiento_inventario')
    .select(MOV_SELECT, { count: 'exact' })
    .order('f_movimiento', { ascending: false })
    .order('id_movimientoinv', { ascending: false })
    .range(desde, hasta);

  if (q.productoId) query = query.eq('id_producto', q.productoId);
  if (q.tipo) query = query.eq('tipo_movimiento', q.tipo);
  if (q.desde) query = query.gte('f_movimiento', `${q.desde}T00:00:00`);
  if (q.hasta) {
    const hastaExclusivo = new Date(`${q.hasta}T00:00:00.000Z`);
    hastaExclusivo.setUTCDate(hastaExclusivo.getUTCDate() + 1);
    query = query.lt('f_movimiento', `${hastaExclusivo.toISOString().slice(0, 10)}T00:00:00`);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(`DB_LIST_FAIL: ${error.message}`);
  return {
    data: ((data ?? []) as unknown as MovimientoRow[]).map(mapMovimiento),
    page: q.page,
    limit: q.limit,
    total: count ?? 0,
  };
}

export async function crearMovimiento(input: MovimientoCreate, usuarioId: number, usucre: string, pc = ''): Promise<MovimientoInventario> {
  const { data: id, error } = await supabase.rpc('fn_registrar_movimiento_inventario', {
    p_producto: input.productoId,
    p_usuario: usuarioId,
    p_tipo: input.tipo,
    p_cantidad: input.cantidad,
    p_costo: input.costo,
    p_documento: input.documento ?? null,
    p_id_pedido: input.idPedido ?? null,
    p_observacion: input.motivo ?? null,
    p_usucre: usucre,
    p_pc: pc,
  });
  if (error) {
    if (error.message.includes('PRODUCTO_INVALIDO') || error.message.includes('STOCK_INSUFICIENTE')) {
      throw new Error(error.message);
    }
    throw new Error(`DB_CREATE_FAIL: ${error.message}`);
  }
  const movimientoId = Number(id);
  if (!Number.isInteger(movimientoId) || movimientoId <= 0) {
    throw new Error('DB_CREATE_FAIL: movimiento sin identificador');
  }
  const { data, error: getError } = await supabase
    .from('movimiento_inventario')
    .select(MOV_SELECT)
    .eq('id_movimientoinv', movimientoId)
    .single();
  if (getError) throw new Error(`DB_GET_FAIL: ${getError.message}`);
  return mapMovimiento(data as unknown as MovimientoRow);
}

export async function listarRecetas(q: RecetaQuery): Promise<{ data: Receta[]; page: number; limit: number; total: number }> {
  const desde = (q.page - 1) * q.limit;
  const hasta = desde + q.limit - 1;

  let query = supabase
    .from('receta')
    .select(RECETA_SELECT, { count: 'exact' })
    .order('id_receta', { ascending: false })
    .range(desde, hasta);

  if (q.productoId) query = query.eq('id_producto', q.productoId);

  const { data, error, count } = await query;
  if (error) throw new Error(`DB_LIST_FAIL: ${error.message}`);
  return {
    data: ((data ?? []) as unknown as RecetaRow[]).map(mapReceta),
    page: q.page,
    limit: q.limit,
    total: count ?? 0,
  };
}

export async function crearReceta(input: RecetaCreate, usucre: string, pc = ''): Promise<Receta> {
  const { data: productos, error: productoErr } = await supabase
    .from('producto')
    .select('id_producto, tipo_producto, estado')
    .in('id_producto', [input.productoId, input.insumoId]);
  if (productoErr) throw new Error(`DB_PRODUCTO_FAIL: ${productoErr.message}`);
  const rows = (productos ?? []) as { id_producto: number; tipo_producto: string; estado: string }[];
  const producto = rows.find((row) => row.id_producto === input.productoId);
  const insumo = rows.find((row) => row.id_producto === input.insumoId);
  if (!producto || producto.estado !== 'A' || producto.tipo_producto === 'I') {
    throw new Error('PRODUCTO_INVALIDO');
  }
  if (!insumo || insumo.estado !== 'A' || insumo.tipo_producto !== 'I') {
    throw new Error('INSUMO_INVALIDO');
  }

  const { data: existente, error: recetaErr } = await supabase
    .from('receta')
    .select('id_receta')
    .eq('id_producto', input.productoId)
    .eq('id_insumo', input.insumoId)
    .eq('estado', 'A')
    .limit(1)
    .maybeSingle();
  if (recetaErr) throw new Error(`DB_GET_FAIL: ${recetaErr.message}`);
  if (existente) throw new Error('RECETA_DUPLICADA');

  const { data, error } = await supabase
    .from('receta')
    .insert({
      id_producto: input.productoId,
      id_insumo: input.insumoId,
      cantidad: input.cantidad,
      ...createAudit(usucre, pc),
    })
    .select(RECETA_SELECT)
    .single();
  if (error) throw new Error(`DB_CREATE_FAIL: ${error.message}`);
  return mapReceta(data as unknown as RecetaRow);
}

export async function actualizarReceta(
  id: number,
  input: RecetaUpdate,
  usumod: string,
  pc = '',
): Promise<Receta | null> {
  const { data: actual, error: actualError } = await supabase
    .from('receta')
    .select('id_producto, id_insumo, estado')
    .eq('id_receta', id)
    .maybeSingle();
  if (actualError) throw new Error(`DB_GET_FAIL: ${actualError.message}`);
  if (!actual) return null;
  const recetaActual = actual as { id_producto: number; id_insumo: number; estado: string };
  if (input.estado === 'A' && recetaActual.estado !== 'A') {
    const { data: productos, error: productoError } = await supabase
      .from('producto')
      .select('id_producto, tipo_producto, estado')
      .in('id_producto', [recetaActual.id_producto, recetaActual.id_insumo]);
    if (productoError) throw new Error(`DB_PRODUCTO_FAIL: ${productoError.message}`);
    const rows = (productos ?? []) as { id_producto: number; tipo_producto: string; estado: string }[];
    const producto = rows.find((row) => row.id_producto === recetaActual.id_producto);
    const insumo = rows.find((row) => row.id_producto === recetaActual.id_insumo);
    if (!producto || producto.estado !== 'A' || producto.tipo_producto === 'I') {
      throw new Error('PRODUCTO_INVALIDO');
    }
    if (!insumo || insumo.estado !== 'A' || insumo.tipo_producto !== 'I') {
      throw new Error('INSUMO_INVALIDO');
    }
    const { data: activa, error: activaError } = await supabase
      .from('receta')
      .select('id_receta')
      .eq('id_producto', recetaActual.id_producto)
      .eq('id_insumo', recetaActual.id_insumo)
      .eq('estado', 'A')
      .neq('id_receta', id)
      .limit(1)
      .maybeSingle();
    if (activaError) throw new Error(`DB_GET_FAIL: ${activaError.message}`);
    if (activa) throw new Error('RECETA_DUPLICADA');
  }
  const patch: Record<string, unknown> = { ...updateAudit(usumod, pc) };
  if (input.cantidad !== undefined) patch['cantidad'] = input.cantidad;
  if (input.estado !== undefined) patch['estado'] = input.estado;
  const { data, error } = await supabase
    .from('receta')
    .update(patch)
    .eq('id_receta', id)
    .select(RECETA_SELECT)
    .maybeSingle();
  if (error) throw new Error(`DB_UPDATE_FAIL: ${error.message}`);
  return data ? mapReceta(data as unknown as RecetaRow) : null;
}

export async function getStockInsumos(q: StockQuery): Promise<StockInsumo[]> {
  let query = supabase
    .from('producto')
    .select('id_producto, n_producto, tipo_producto, id_categoriaproducto, stock_actual, stock_minimo, id_unidad, categoria_producto(n_categoriaproducto), unidad_medida(n_unidad)')
    .eq('estado', 'A')
    .eq('tipo_producto', 'I');

  if (q.productoId) {
    query = query.eq('id_producto', q.productoId);
  }

  if (q.nombre) {
    query = query.ilike('n_producto', `%${q.nombre}%`);
  }

  if (q.categoriaId) {
    query = query.eq('id_categoriaproducto', q.categoriaId);
  }

  if (q.unidadId) {
    query = query.eq('id_unidad', q.unidadId);
  }

  if (q.stockMinimoDesde !== undefined) {
    query = query.gte('stock_minimo', q.stockMinimoDesde);
  }

  if (q.stockMinimoHasta !== undefined) {
    query = query.lte('stock_minimo', q.stockMinimoHasta);
  }

  if (q.stockActualDesde !== undefined) {
    query = query.gte('stock_actual', q.stockActualDesde);
  }

  if (q.stockActualHasta !== undefined) {
    query = query.lte('stock_actual', q.stockActualHasta);
  }

  const ordenColumna = q.ordenarPor === 'stock_actual' ? 'stock_actual' : q.ordenarPor === 'stock_minimo' ? 'stock_minimo' : 'n_producto';
  query = query.order(ordenColumna, { ascending: q.ordenDireccion === 'asc' });

  const { data, error } = await query;
  if (error) throw new Error(`DB_STOCK_FAIL: ${error.message}`);

  let rows = (data ?? []) as unknown as StockRow[];

  if (q.soloBajoStock !== undefined) {
    rows = rows.filter((row) => {
      const stockActual = Number(row.stock_actual ?? 0);
      const stockMinimo = Number(row.stock_minimo ?? 0);
      return q.soloBajoStock ? stockActual <= stockMinimo : stockActual > stockMinimo;
    });
  }

  return rows.map((row) => {
    const stockActual = Number(row.stock_actual ?? 0);
    const stockMinimo = Number(row.stock_minimo ?? 0);
    return {
      idProducto: row.id_producto,
      producto: row.n_producto,
      tipoProducto: row.tipo_producto,
      categoriaId: row.id_categoriaproducto,
      stockActual,
      stockMinimo,
      unidadId: row.id_unidad,
      unidadMedida: row.unidad_medida?.n_unidad ?? null,
      categoria: row.categoria_producto?.n_categoriaproducto ?? null,
      estadoBajoStock: stockActual <= stockMinimo,
    };
  });
}
