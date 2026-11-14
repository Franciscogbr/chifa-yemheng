import { listarKardex } from '../repositories/kardex-repository.js';
import type { KardexQuery } from '../schemas/kardex.schema.js';

export interface KardexItem {
  id: number;
  productoId: number;
  producto: string;
  codigo: string;
  categoria: string | null;
  clasificacion: string | null;
  unidad: string | null;
  tipo: string;
  tipoMovimientoLabel: string;
  cantidad: number;
  stockAnterior: number;
  saldo: number;
  costoUnitario: number;
  costoTotal: number;
  documento: string | null;
  descripcion: string | null;
  fecha: string;
  usuario: string | null;
  esEntrada: boolean;
  esSalida: boolean;
}

export interface KardexIndicadores {
  stockActual: number;
  totalEntradas: number;
  totalSalidas: number;
  stockInicial: number;
  stockFinal: number;
  valorizacionTotal: number;
}

export interface KardexLista {
  data: KardexItem[];
  page: number;
  limit: number;
  total: number;
  indicadores: KardexIndicadores;
}

const TIPO_LABEL: Record<string, string> = {
  E: 'COMPRAS',
  S: 'CONSUMO',
  A: 'AJUSTES',
  M: 'MERMAS',
};

/**
 * Mapea un tipo de movimiento interno a una descripción de negocio del kardex.
 * Se respetan los tipos existentes (E, S, A, M) y se etiquetan con su nombre de negocio.
 */
function etiquetaTipo(tipo: string): string {
  return TIPO_LABEL[tipo] ?? tipo;
}

export async function listarKardexService(q: KardexQuery): Promise<KardexLista> {
  const result = await listarKardex(q);

  const data: KardexItem[] = result.data.map((row: any) => {
    const tipo = row.tipo_movimiento;
    const esEntrada = tipo === 'E' || tipo === 'A';
    const esSalida = tipo === 'S' || tipo === 'M';
    const cantidad = Number(row.cantidad ?? 0);
    const saldo = Number(row.stock_nuevo ?? 0);
    const costoUnitario = Number(row.costo_unitario ?? 0);
    const costoTotal = esSalida ? -(cantidad * costoUnitario) : cantidad * costoUnitario;

    return {
      id: row.id_movimientoinv,
      productoId: row.id_producto,
      producto: row.producto?.n_producto ?? '',
      codigo: row.producto?.codigo ?? '',
      categoria: row.producto?.categoria_producto?.n_categoriaproducto ?? null,
      clasificacion: row.producto?.clasificacion ?? null,
      unidad: row.producto?.unidad_medida?.n_unidad ?? null,
      tipo,
      tipoMovimientoLabel: etiquetaTipo(tipo),
      cantidad,
      stockAnterior: Number(row.stock_anterior ?? 0),
      saldo,
      costoUnitario,
      costoTotal,
      documento: row.documento ?? null,
      descripcion: row.observacion ?? null,
      fecha: row.f_movimiento,
      usuario: row.usuario?.logeo ?? null,
      esEntrada,
      esSalida,
    };
  });

  const totalEntradas = data
    .filter((d) => d.esEntrada)
    .reduce((acc, d) => acc + d.cantidad, 0);
  const totalSalidas = data
    .filter((d) => d.esSalida)
    .reduce((acc, d) => acc + d.cantidad, 0);
  const stockInicial = data.length > 0 ? data[0].stockAnterior : 0;
  const stockFinal = data.length > 0 ? data[data.length - 1].saldo : stockInicial;
  const valorizacionTotal = data.reduce((acc, d) => acc + d.costoTotal, 0);

  return {
    data,
    page: result.page,
    limit: result.limit,
    total: result.total,
    indicadores: {
      stockActual: stockFinal,
      totalEntradas,
      totalSalidas,
      stockInicial,
      stockFinal,
      valorizacionTotal,
    },
  };
}
