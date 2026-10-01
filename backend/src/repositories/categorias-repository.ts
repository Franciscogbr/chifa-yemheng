import { supabase } from '../config/supabase.js';
import type { Categoria, CategoriaLista } from '../models/categoria.js';
import type { CategoriaCreate, CategoriaQuery, CategoriaUpdate } from '../schemas/categoria.js';
import { createAudit, updateAudit } from '../utils/auditoria.js';

interface CategoriaRow {
  id_categoriaproducto: number;
  n_categoriaproducto: string;
  descripcion: string | null;
  area_despacho: string;
  orden_carta: number;
  f_creacion: string;
  estado: string;
}

function mapRow(row: CategoriaRow, productosAsociados: number): Categoria {
  return {
    id: row.id_categoriaproducto,
    nombre: row.n_categoriaproducto,
    descripcion: row.descripcion,
    area: (row.area_despacho ?? 'COCINA') as Categoria['area'],
    orden: row.orden_carta ?? 0,
    estado: (row.estado ?? 'A') as Categoria['estado'],
    productosAsociados,
    fCreacion: row.f_creacion,
  };
}

async function contarProductos(idCategoria: number): Promise<number> {
  const { count, error } = await supabase
    .from('producto')
    .select('id_producto', { count: 'exact', head: true })
    .eq('id_categoriaproducto', idCategoria);
  if (error) {
    throw new Error(`DB_COUNT_FAIL: ${error.message}`);
  }
  return count ?? 0;
}

export async function listarCategorias(q: CategoriaQuery): Promise<CategoriaLista> {
  const desde = (q.page - 1) * q.limit;
  const hasta = desde + q.limit - 1;

  let query = supabase
    .from('categoria_producto')
    .select(
      'id_categoriaproducto, n_categoriaproducto, descripcion, area_despacho, orden_carta, f_creacion, estado',
      { count: 'exact' },
    )
    .order('orden_carta', { ascending: true })
    .range(desde, hasta);

  if (q.nombre) {
    query = query.ilike('n_categoriaproducto', `%${q.nombre}%`);
  }
  if (q.estado) {
    query = query.eq('estado', q.estado);
  }

  const { data, error, count } = await query;
  if (error) {
    throw new Error(`DB_LIST_FAIL: ${error.message}`);
  }
  const rows = (data ?? []) as CategoriaRow[];
  const data2: Categoria[] = [];
  for (const row of rows) {
    data2.push(mapRow(row, await contarProductos(row.id_categoriaproducto)));
  }
  return { data: data2, page: q.page, limit: q.limit, total: count ?? 0 };
}

export async function obtenerCategoria(id: number): Promise<Categoria | null> {
  const { data, error } = await supabase
    .from('categoria_producto')
    .select(
      'id_categoriaproducto, n_categoriaproducto, descripcion, area_despacho, orden_carta, f_creacion, estado',
    )
    .eq('id_categoriaproducto', id)
    .maybeSingle();
  if (error) {
    throw new Error(`DB_GET_FAIL: ${error.message}`);
  }
  if (!data) {
    return null;
  }
  const row = data as CategoriaRow;
  return mapRow(row, await contarProductos(row.id_categoriaproducto));
}

export async function existeNombre(nombre: string, excluirId?: number): Promise<boolean> {
  let query = supabase
    .from('categoria_producto')
    .select('id_categoriaproducto', { count: 'exact', head: true })
    .ilike('n_categoriaproducto', nombre);
  if (excluirId !== undefined) {
    query = query.neq('id_categoriaproducto', excluirId);
  }
  const { count, error } = await query;
  if (error) {
    throw new Error(`DB_EXISTS_FAIL: ${error.message}`);
  }
  return (count ?? 0) > 0;
}

export async function maxOrden(): Promise<number> {
  const { data, error } = await supabase
    .from('categoria_producto')
    .select('orden_carta')
    .order('orden_carta', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    throw new Error(`DB_MAX_FAIL: ${error.message}`);
  }
  const row = data as { orden_carta: number } | null;
  return row?.orden_carta ?? 0;
}

export async function crearCategoria(
  input: CategoriaCreate,
  usucre: string,
  pc = '',
): Promise<Categoria> {
  const orden = input.orden ?? (await maxOrden()) + 1;
  const { data, error } = await supabase
    .from('categoria_producto')
    .insert({
      n_categoriaproducto: input.nombre,
      descripcion: input.descripcion ?? '',
      area_despacho: input.area,
      orden_carta: orden,
      estado: input.estado,
      ...createAudit(usucre, pc),
    })
    .select(
      'id_categoriaproducto, n_categoriaproducto, descripcion, area_despacho, orden_carta, f_creacion, estado',
    )
    .single();
  if (error) {
    throw new Error(`DB_CREATE_FAIL: ${error.message}`);
  }
  const row = data as CategoriaRow;
  return mapRow(row, 0);
}

export async function actualizarCategoria(
  id: number,
  input: CategoriaUpdate,
  usumod: string,
  pc = '',
): Promise<Categoria | null> {
  const patch: Record<string, unknown> = { ...updateAudit(usumod, pc) };
  if (input.nombre !== undefined) {
    patch['n_categoriaproducto'] = input.nombre;
  }
  if (input.descripcion !== undefined) {
    patch['descripcion'] = input.descripcion;
  }
  if (input.area !== undefined) {
    patch['area_despacho'] = input.area;
  }
  if (input.orden !== undefined) {
    patch['orden_carta'] = input.orden;
  }
  if (input.estado !== undefined) {
    patch['estado'] = input.estado;
  }
  const { data, error } = await supabase
    .from('categoria_producto')
    .update(patch)
    .eq('id_categoriaproducto', id)
    .select(
      'id_categoriaproducto, n_categoriaproducto, descripcion, area_despacho, orden_carta, f_creacion, estado',
    )
    .maybeSingle();
  if (error) {
    throw new Error(`DB_UPDATE_FAIL: ${error.message}`);
  }
  if (!data) {
    return null;
  }
  const row = data as CategoriaRow;
  return mapRow(row, await contarProductos(row.id_categoriaproducto));
}

export async function auditar(
  idUsuario: number,
  accion: string,
  idRegistro: number,
  valor: string,
): Promise<void> {
  const { error } = await supabase.from('auditoria').insert({
    id_usuario: idUsuario,
    n_tabla: 'CATEGORIA_PRODUCTO',
    accion,
    id_registro: idRegistro,
    valor_nuevo: valor,
  });
  if (error) {
    throw new Error(`DB_AUDIT_FAIL: ${error.message}`);
  }
}
