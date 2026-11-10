import { supabase } from '../config/supabase.js';
import type { MovimientoCreate, MovimientoQuery, RecetaCostoQuery, RecetaCreate, RecetaQuery, RecetaUpdate, StockQuery } from '../schemas/inventario.js';
import {
  actualizarReceta,
  crearMovimiento,
  crearReceta,
  getStockInsumos,
  listarMovimientos,
  listarRecetas,
} from '../repositories/inventario-repository.js';
import { obtenerProducto } from '../repositories/productos-repository.js';
import { obtenerDetallePorId } from '../repositories/pedidos-repository.js';
import { InventarioError, type RecetaCostoDetalle, type RecetaCostoResultado, type StockInsumo } from '../models/inventario.js';

export async function listarMovimientosService(q: MovimientoQuery) {
  return listarMovimientos(q);
}
export async function crearMovimientoService(input: MovimientoCreate, usuarioId: number, usucre: string, pc?: string) {
  try {
    return await crearMovimiento(input, usuarioId, usucre, pc);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('PRODUCTO_INVALIDO')) throw new InventarioError('PRODUCTO_INVALIDO');
    if (msg.includes('STOCK_INSUFICIENTE')) throw new InventarioError('STOCK_INSUFICIENTE');
    throw err;
  }
}
export async function listarRecetasService(q: RecetaQuery) {
  return listarRecetas(q);
}
export async function crearRecetaService(input: RecetaCreate, usucre: string, pc?: string) {
  try {
    return await crearReceta(input, usucre, pc);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('INSUMO_INVALIDO')) throw new InventarioError('INSUMO_INVALIDO');
    if (msg.includes('PRODUCTO_INVALIDO')) throw new InventarioError('PRODUCTO_INVALIDO');
    throw err;
  }
}

export async function actualizarRecetaService(id: number, input: RecetaUpdate, usumod: string, pc?: string) {
  try {
    const receta = await actualizarReceta(id, input, usumod, pc);
    if (!receta) throw new InventarioError('NOT_FOUND');
    return receta;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('RECETA_DUPLICADA')) throw new InventarioError('RECETA_DUPLICADA');
    if (msg.includes('PRODUCTO_INVALIDO')) throw new InventarioError('PRODUCTO_INVALIDO');
    if (msg.includes('INSUMO_INVALIDO')) throw new InventarioError('INSUMO_INVALIDO');
    throw err;
  }
}

export async function getStockInsumosService(q: StockQuery): Promise<StockInsumo[]> {
  return getStockInsumos(q);
}

export async function getCostoRecetaService(q: RecetaCostoQuery): Promise<RecetaCostoResultado> {
  const { data: recetas } = await listarRecetas({ page: 1, limit: 100, productoId: q.productoId });

  if (!recetas || recetas.length === 0) {
    throw new Error('RECETA_NO_ENCONTRADA');
  }

  const producto = recetas[0].producto;
  const productoId = recetas[0].productoId;

  const detalles: RecetaCostoDetalle[] = [];
  let costoTotal = 0;

  for (const receta of recetas) {
    const insumo = await obtenerProducto(receta.insumoId);
    if (!insumo) {
      continue;
    }
    const subtotal = Number(insumo.costo) * Number(receta.cantidad);
    costoTotal += subtotal;
    detalles.push({
      insumoId: insumo.id,
      insumo: insumo.nombre,
      cantidad: Number(receta.cantidad),
      unidad: insumo.unidad,
      costoUnitario: Number(insumo.costo),
      subtotal,
    });
  }

  return {
    productoId,
    producto,
    costoTotal,
    detalles,
  };
}

/**
 * Descuenta los insumos de la receta de un producto cuando un plato se marca como Listo.
 * Crea un movimiento de inventario tipo 'S' por cada insumo de la receta,
 * multiplicado por la cantidad de platos del detalle.
 *
 * Es idempotente: si ya existe un movimiento de salida para este detalle,
 * no vuelve a descontar. Valida el stock de todos los insumos antes de aplicar
 * cualquier descuento para evitar salidas parciales.
 */
export async function descontarInsumosPorDetalle(
  detalleId: number,
  usuarioId: number,
  usucre: string,
  pc = '',
): Promise<{ descontado: boolean; insumos: string[]; errores: string[] }> {
  const detalle = await obtenerDetallePorId(detalleId);
  if (!detalle) {
    throw new Error('DETALLE_NO_ENCONTRADO');
  }

  const documento = `DETALLE-${detalleId}`;
  const pedidoId = Number((detalle as any).id_pedido ?? (detalle as any).pedidoId ?? 0) || null;

  // Idempotencia: si ya existe un movimiento de salida para este detalle, no volver a descontar.
  const { data: existente } = await supabase
    .from('movimiento_inventario')
    .select('id_movimientoinv')
    .eq('documento', documento)
    .eq('tipo_movimiento', 'S')
    .maybeSingle();

  if (existente) {
    return { descontado: true, insumos: [], errores: [] };
  }

  const cantidadPlatos = Number(detalle.cantidad) > 0 ? Number(detalle.cantidad) : 1;

  const recetas = await listarRecetas({ page: 1, limit: 100, productoId: detalle.id_producto });

  // Validar stock de todos los insumos ANTES de aplicar ningún descuento.
  const validaciones: Array<{
    insumoId: number;
    insumoNombre: string;
    cantidadTotal: number;
    stockActual: number;
    controlaStock: boolean;
    costo: number;
  }> = [];

  for (const receta of recetas.data ?? []) {
    const insumo = await obtenerProducto(receta.insumoId);
    if (!insumo || insumo.estado !== 'A') {
      throw new Error(`INSUMO_INVALIDO: ${receta.insumo}`);
    }
    const cantidadTotal = Number(receta.cantidad) * cantidadPlatos;
    const stockActual = Number(insumo.stock ?? 0);
    const controlaStock = insumo.controlaStock === true;
    if (controlaStock && stockActual < cantidadTotal) {
      throw new Error(`STOCK_INSUFICIENTE: ${insumo.nombre}`);
    }
    validaciones.push({
      insumoId: insumo.id,
      insumoNombre: insumo.nombre,
      cantidadTotal,
      stockActual,
      controlaStock,
      costo: Number(insumo.costo ?? 0),
    });
  }

  // Aplicar descuentos. Si alguno falla, se lanza error para evitar descuento parcial silencioso.
  // No se continúa con los siguientes insumos una vez que hay un fallo.
  const insumosDescontados: string[] = [];

  for (const v of validaciones) {
    try {
      await crearMovimiento(
        {
          productoId: v.insumoId,
          tipo: 'S',
          cantidad: v.cantidadTotal,
          costo: v.costo,
          motivo: `Detalle ${detalleId} · ${v.insumoNombre} · ${documento}`,
          documento,
          idPedido: pedidoId ?? undefined,
        },
        usuarioId,
        usucre,
        pc,
      );
      insumosDescontados.push(v.insumoNombre);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`No se pudo descontar ${v.insumoNombre}: ${msg}`);
    }
  }

  return { descontado: true, insumos: insumosDescontados, errores: [] };
}
