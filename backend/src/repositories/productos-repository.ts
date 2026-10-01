import { supabase } from '../config/supabase.js';
import type { Producto, ProductoLista } from '../models/producto.js';
import type { ProductoCreate, ProductoQuery, ProductoUpdate } from '../schemas/producto.js';
import { createAudit, updateAudit } from '../utils/auditoria.js';

interface ProductoRow {
  id_producto: number;
  n_producto: string;
  codigo: string | null;
  id_categoriaproducto: number;
  categoria_producto: { n_categoriaproducto: string } | null;
  tipo_producto: string;
  precio: number;
  costo: number;
  id_unidad: number;
  unidad_medida: { n_unidad: string } | null;
  stock_actual: number;
  stock_minimo: number;
  controla_stock: string;
  tiempo_preparacion: number | null;
  disponible: string;
  imagen: string | null;
  detalle: string | null;
  afecto_igv: string;
  estado: string;
}

const SELECT =
  'id_producto, n_producto, codigo, id_categoriaproducto, categoria_producto(n_categoriaproducto), tipo_producto, precio, costo, id_unidad, unidad_medida(n_unidad), stock_actual, stock_minimo, controla_stock, tiempo_preparacion, disponible, imagen, detalle, afecto_igv, estado';

function mapRow(row: ProductoRow): Producto {
  return {
    id: row.id_producto,
    nombre: row.n_producto,
    codigo: row.codigo,
    categoriaId: row.id_categoriaproducto,
    categoria: row.categoria_producto?.n_categoriaproducto ?? '',
    tipo: (row.tipo_producto ?? 'P') as Producto['tipo'],
    precio: Number(row.precio ?? 0),
    costo: Number(row.costo ?? 0),
    unidadId: row.id_unidad,
    unidad: row.unidad_medida?.n_unidad ?? '',
    stock: Number(row.stock_actual ?? 0),
    stockMin: Number(row.stock_minimo ?? 0),
    controlaStock: row.controla_stock === 'S',
    tiempo: row.tiempo_preparacion,
    disponible: row.disponible !== 'N',
    imagen: row.imagen,
    detalle: row.detalle,
    afectoIgv: row.afecto_igv !== 'N',
    estado: (row.estado ?? 'A') as Producto['estado'],
  };
}

function sn(v: boolean): string {
  return v ? 'S' : 'N';
}

export async function listarProductos(q: ProductoQuery): Promise<ProductoLista> {
  const desde = (q.page - 1) * q.limit;
  const hasta = desde + q.limit - 1;

  let query = supabase
    .from('producto')
    .select(SELECT, { count: 'exact' })
    .order('id_producto', { ascending: true })
    .range(desde, hasta);

  if (q.nombre) {
    query = query.ilike('n_producto', `%${q.nombre}%`);
  }
  if (q.categoria !== undefined) {
    query = query.eq('id_categoriaproducto', q.categoria);
  }
  if (q.estado) {
    query = query.eq('estado', q.estado);
  }
  if (q.disponible) {
    query = query.eq('disponible', q.disponible);
  }

  const { data, error, count } = await query;
  if (error) {
    throw new Error(`DB_LIST_FAIL: ${error.message}`);
  }
  return {
    data: ((data ?? []) as unknown as ProductoRow[]).map(mapRow),
    page: q.page,
    limit: q.limit,
    total: count ?? 0,
  };
}

export async function obtenerProducto(id: number): Promise<Producto | null> {
  const { data, error } = await supabase.from('producto').select(SELECT).eq('id_producto', id).maybeSingle();
  if (error) {
    throw new Error(`DB_GET_FAIL: ${error.message}`);
  }
  if (!data) {
    return null;
  }
  return mapRow(data as unknown as ProductoRow);
}

export async function existeCodigo(codigo: string, excluirId?: number): Promise<boolean> {
  let query = supabase
    .from('producto')
    .select('id_producto', { count: 'exact', head: true })
    .eq('codigo', codigo);
  if (excluirId !== undefined) {
    query = query.neq('id_producto', excluirId);
  }
  const { count, error } = await query;
  if (error) {
    throw new Error(`DB_EXISTS_FAIL: ${error.message}`);
  }
  return (count ?? 0) > 0;
}

export async function categoriaActiva(id: number): Promise<boolean> {
  const { data, error } = await supabase
    .from('categoria_producto')
    .select('estado')
    .eq('id_categoriaproducto', id)
    .maybeSingle();
  if (error) {
    throw new Error(`DB_CAT_FAIL: ${error.message}`);
  }
  const row = data as { estado: string } | null;
  return !!row && row.estado === 'A';
}

export async function crearProducto(input: ProductoCreate, usucre: string, pc = ''): Promise<Producto> {
  const { data, error } = await supabase
    .from('producto')
    .insert({
      n_producto: input.nombre,
      id_categoriaproducto: input.categoriaId,
      id_unidad: input.unidadId,
      tipo_producto: input.tipo,
      precio: input.precio,
      costo: input.costo,
      stock_actual: input.stock,
      stock_minimo: input.stockMin,
      controla_stock: sn(input.controlaStock),
      tiempo_preparacion: input.tiempo ?? null,
      disponible: sn(input.disponible),
      imagen: input.imagen || null,
      detalle: input.detalle || null,
      afecto_igv: sn(input.afectoIgv),
      codigo: input.codigo?.trim() ? input.codigo.trim() : null,
      estado: input.estado,
      ...createAudit(usucre, pc),
    })
    .select(SELECT)
    .single();
  if (error) {
    throw new Error(`DB_CREATE_FAIL: ${error.message}`);
  }
  return mapRow(data as unknown as ProductoRow);
}

export async function actualizarProducto(
  id: number,
  input: ProductoUpdate,
  usumod: string,
  pc = '',
): Promise<Producto | null> {
  const patch: Record<string, unknown> = { ...updateAudit(usumod, pc) };
  if (input.nombre !== undefined) {
    patch['n_producto'] = input.nombre;
  }
  if (input.categoriaId !== undefined) {
    patch['id_categoriaproducto'] = input.categoriaId;
  }
  if (input.unidadId !== undefined) {
    patch['id_unidad'] = input.unidadId;
  }
  if (input.tipo !== undefined) {
    patch['tipo_producto'] = input.tipo;
  }
  if (input.precio !== undefined) {
    patch['precio'] = input.precio;
  }
  if (input.costo !== undefined) {
    patch['costo'] = input.costo;
  }
  if (input.stock !== undefined) {
    patch['stock_actual'] = input.stock;
  }
  if (input.stockMin !== undefined) {
    patch['stock_minimo'] = input.stockMin;
  }
  if (input.controlaStock !== undefined) {
    patch['controla_stock'] = sn(input.controlaStock);
  }
  if (input.tiempo !== undefined) {
    patch['tiempo_preparacion'] = input.tiempo;
  }
  if (input.disponible !== undefined) {
    patch['disponible'] = sn(input.disponible);
  }
  if (input.imagen !== undefined) {
    patch['imagen'] = input.imagen || null;
  }
  if (input.detalle !== undefined) {
    patch['detalle'] = input.detalle || null;
  }
  if (input.afectoIgv !== undefined) {
    patch['afecto_igv'] = sn(input.afectoIgv);
  }
  if (input.codigo !== undefined) {
    patch['codigo'] = input.codigo?.trim() ? input.codigo.trim() : null;
  }
  if (input.estado !== undefined) {
    patch['estado'] = input.estado;
  }
  const { data, error } = await supabase
    .from('producto')
    .update(patch)
    .eq('id_producto', id)
    .select(SELECT)
    .maybeSingle();
  if (error) {
    throw new Error(`DB_UPDATE_FAIL: ${error.message}`);
  }
  if (!data) {
    return null;
  }
  return mapRow(data as unknown as ProductoRow);
}

export async function auditar(
  idUsuario: number,
  accion: string,
  idRegistro: number,
  valor: string,
): Promise<void> {
  const { error } = await supabase.from('auditoria').insert({
    id_usuario: idUsuario,
    n_tabla: 'PRODUCTO',
    accion,
    id_registro: idRegistro,
    valor_nuevo: valor,
  });
  if (error) {
    throw new Error(`DB_AUDIT_FAIL: ${error.message}`);
  }
}
