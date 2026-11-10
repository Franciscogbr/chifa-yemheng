import { supabase } from '../config/supabase.js';

export interface MovimientoResumenItem {
  medio: string;
  cantidad: number;
  monto: number;
  afectaEfectivo: boolean;
}

export interface MovimientoResumen {
  movimientos: MovimientoResumenItem[];
  total: number;
}

/**
 * Resume los movimientos de INGRESO (id_tipomovimiento = 1) de una apertura de caja,
 * agrupados por medio de pago (metodo_pago).
 *
 * @param aperturaId id_aperturacaja del turno a resumir.
 */
export async function getMovimientosResumenPorMetodo(
  aperturaId: number,
): Promise<MovimientoResumen> {
  try {
    const { data, error } = await supabase
      .from('movimiento_caja')
      .select('monto, id_tipomovimiento, metodo_pago(n_metodopago, afecta_efectivo)')
      .eq('id_aperturacaja', aperturaId)
      .eq('estado', 'A')
      .eq('id_tipomovimiento', 1); // INGRESO
    if (error) {
      throw new Error(`DB_RESUMEN_FAIL: ${error.message}`);
    }

    const rows = (data ?? []) as unknown as Record<string, unknown>[];
    const porMedio = new Map<
      string,
      { cantidad: number; monto: number; afectaEfectivo: boolean }
    >();

    for (const row of rows) {
      const metodo = row['metodo_pago'] as Record<string, unknown> | null;
      const medio = String(metodo?.['n_metodopago'] ?? 'Otro');
      const monto = Number(row['monto'] ?? 0);
      const afectaEfectivo = String(metodo?.['afecta_efectivo'] ?? 'N') === 'S';

      const existente = porMedio.get(medio);
      if (existente) {
        existente.cantidad += 1;
        existente.monto += monto;
      } else {
        porMedio.set(medio, { cantidad: 1, monto, afectaEfectivo });
      }
    }

    const movimientos: MovimientoResumenItem[] = Array.from(porMedio.entries()).map(
      ([medio, v]) => ({
        medio,
        cantidad: v.cantidad,
        monto: Math.round(v.monto * 100) / 100,
        afectaEfectivo: v.afectaEfectivo,
      }),
    );
    const total = Math.round(
      movimientos.reduce((sum, m) => sum + m.monto, 0) * 100,
    ) / 100;

    return { movimientos, total };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`NO_SE_PUDO_OBTENER_RESUMEN_MOVIMIENTOS: ${msg}`);
  }
}
