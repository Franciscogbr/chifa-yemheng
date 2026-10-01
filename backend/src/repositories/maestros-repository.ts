import { supabase } from '../config/supabase.js';

export interface Maestro {
  id: number;
  nombre: string;
  area?: string | null;
  abreviatura?: string | null;
}

async function listar(
  tabla: string,
  idCol: string,
  nombreCol: string,
  extra?: string,
): Promise<Maestro[]> {
  const cols = extra ? `${idCol}, ${nombreCol}, ${extra}` : `${idCol}, ${nombreCol}`;
  const { data, error } = await supabase
    .from(tabla)
    .select(cols)
    .eq('estado', 'A')
    .order(idCol, { ascending: true });
  if (error) {
    throw new Error(`DB_LIST_FAIL: ${error.message}`);
  }
  return ((data ?? []) as unknown as Record<string, unknown>[]).map((r) => ({
    id: Number(r[idCol]),
    nombre: String(r[nombreCol] ?? ''),
    ...(extra === 'area' ? { area: (r['area'] as string | null) ?? null } : {}),
    ...(extra === 'abreviatura'
      ? { abreviatura: (r['abreviatura'] as string | null) ?? null }
      : {}),
  }));
}

/** Distritos con estado A (Ica + aledaños). */
export function listarDistritos(): Promise<Maestro[]> {
  return listar('distrito', 'id_distrito', 'd_distrito');
}

/** Cargos con estado A (los reales de BD, sin inventados). */
export function listarCargos(): Promise<Maestro[]> {
  return listar('cargo', 'id_cargo', 'n_cargo', 'area');
}

/** Contratos con estado A. */
export function listarContratos(): Promise<Maestro[]> {
  return listar('contrato', 'id_contrato', 'n_contrato');
}

/** Tipos de identidad con estado A (DNI/RUC/CE/PAS). */
export function listarTiposIdentidad(): Promise<Maestro[]> {
  return listar('tipo_identidad', 'id_tipoidentidad', 'n_tipoidentidad', 'abreviatura');
}
