import { useEffect, useMemo, useRef, useState } from 'react';
import type { Maestro, Provincia } from '../services/maestros';

interface UbicacionPickerProps {
  /** Id del distrito elegido (`0` = Otro / Sin especificar). Única fuente de verdad. */
  value: number;
  onChange: (id: number) => void;
  /** Listas vivas desde `GET /maestros/*` (dep 25, prov 197, dist 1891). */
  departamentos: Maestro[];
  provincias: Provincia[];
  distritos: Maestro[];
  cargando: boolean;
  error?: string | null;
  onReintentar?: () => void;
  disabled?: boolean;
  /**
   * Cadena resuelta remotamente (por ubigeo) para seleccionar los tres niveles
   * sin depender de tiempos de carga ni del FK local.
   */
  prefillChain?: {
    depId: number;
    provId: number;
    distId: number;
    depName?: string;
    provName?: string;
    distName?: string;
    token: number;
  } | null;
}

const OTRO = 'Otro / Sin especificar';

const selectClase =
  'w-full cursor-pointer appearance-none rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none transition-colors hover:bg-[#EFEFEF] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-1 focus-visible:ring-[#A61E22]';

/**
 * Tres selects en cadena: Departamento → Provincia → Distrito
 * Dep/prov se derivan del `value` (distrito); en manual, un override local
 * sostiene la selección parcial hasta elegir distrito. Cambiar un nivel
 * superior resetea los inferiores a 0. Valor `0` = Otro (= NULL en BD)
 */
export function UbicacionPicker({
  value,
  onChange,
  departamentos,
  provincias,
  distritos,
  cargando,
  error,
  onReintentar,
  disabled,
  prefillChain = null,
}: UbicacionPickerProps) {
  const [manual, setManual] = useState<{ dep: number; prov: number; dist: number } | null>(null);
  const ultimoValue = useRef(value);
  const ultimoPrefillToken = useRef<number | null>(null);

  // Un cambio externo del distrito (lupa por ubigeo, edición, reset) manda: se suelta el override.
  useEffect(() => {
    if (value !== ultimoValue.current) {
      ultimoValue.current = value;
      setManual(null);
    }
  }, [value]);

  // La cadena resuelta remotamente tiene prioridad: no depende del listado ni del FK vinculado
  useEffect(() => {
    if (!prefillChain?.distId || prefillChain.token === ultimoPrefillToken.current) {
      return;
    }
    ultimoPrefillToken.current = prefillChain.token;
    setManual({ dep: prefillChain.depId, prov: prefillChain.provId, dist: prefillChain.distId });
    ultimoValue.current = prefillChain.distId;
  }, [prefillChain?.depId, prefillChain?.provId, prefillChain?.distId, prefillChain?.token]);

  const cadena = useMemo(() => {
    if (manual) {
      return manual;
    }
    if (value === 0) {
      return { dep: 0, prov: 0, dist: 0 };
    }
    const dist = distritos.find((d) => d.id === value);
    const prov = provincias.find((p) => p.id === (dist?.provinciaId ?? 0));
    return { dep: prov ? prov.departamentoId : 0, prov: prov ? prov.id : 0, dist: value };
  }, [manual, value, distritos, provincias]);

  const provinciasFiltradas = useMemo(
    () => (cadena.dep === 0 ? [] : provincias.filter((p) => p.departamentoId === cadena.dep)),
    [provincias, cadena.dep],
  );

  const provinciasVisibles = useMemo(() => {
    const base = [...provinciasFiltradas];
    if (
      cadena.prov > 0 &&
      !base.some((p) => p.id === cadena.prov) &&
      prefillChain?.provId === cadena.prov
    ) {
      base.unshift({
        id: cadena.prov,
        nombre: prefillChain?.provName ?? `Provincia ${cadena.prov}`,
        departamentoId: cadena.dep,
        area: null,
        abreviatura: null,
      });
    }
    return base;
  }, [provinciasFiltradas, cadena, prefillChain?.provId, prefillChain?.provName]);

  const distritosVisibles = useMemo(() => {
    if (cadena.prov === 0) {
      return [];
    }
    const base = distritos.filter((d) => (d.provinciaId ?? 0) === cadena.prov);
    if (
      cadena.dist && cadena.dist > 0 &&
      !base.some((d) => d.id === cadena.dist) &&
      prefillChain?.distId === cadena.dist
    ) {
      base.unshift({
        id: cadena.dist,
        nombre: prefillChain?.distName ?? `Distrito ${cadena.dist}`,
        area: null,
        abreviatura: null,
        provinciaId: cadena.prov,
      });
    }
    return base;
  }, [distritos, cadena, prefillChain?.distId, prefillChain?.distName]);

const alCambiarDep = (id: number) => {
    ultimoValue.current = 0;
    setManual({ dep: id, prov: 0, dist: 0 });
    onChange(0);
  };

  const alCambiarProv = (id: number) => {
    ultimoValue.current = 0;
    setManual({ dep: cadena.dep, prov: id, dist: 0 });
    onChange(0);
  };

  if (error && !cargando) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border border-[#DC2626]/30 bg-[#DC2626]/10 px-3.5 py-2.5 text-sm">
        <span className="text-xs text-[#7F1518]">{error}</span>
        {onReintentar && (
          <button
            type="button"
            onClick={onReintentar}
            className="shrink-0 cursor-pointer rounded-lg bg-white px-3 py-1 text-xs font-bold shadow-sm transition-colors hover:bg-[#F5F5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A61E22]/50"
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">
          Departamento
        </span>
        <select
          aria-label="Departamento"
          value={cadena.dep}
          disabled={disabled || cargando}
          onChange={(e) => alCambiarDep(Number(e.target.value))}
          className={selectClase}
        >
          <option value={0}>{cargando ? 'Cargando…' : 'Seleccionar departamento…'}</option>
          {departamentos.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Provincia</span>
        <select
          aria-label="Provincia"
          value={cadena.prov}
          disabled={disabled || cargando || cadena.dep === 0}
          onChange={(e) => alCambiarProv(Number(e.target.value))}
          className={selectClase}
        >
          <option value={0}>
            {cadena.dep === 0 ? 'Elige un departamento…' : 'Seleccionar provincia…'}
          </option>
          {provinciasVisibles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Distrito</span>
        <select
          aria-label="Distrito"
          value={cadena.dist && cadena.dist > 0 ? cadena.dist : value}
          disabled={disabled || cargando || cadena.prov === 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className={selectClase}
        >
          <option value={0}>{cadena.prov === 0 ? 'Elige una provincia…' : OTRO}</option>
          {cadena.prov !== 0 &&
            distritosVisibles.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
        </select>
      </label>
    </div>
  );
}
