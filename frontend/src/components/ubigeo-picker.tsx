import { useCallback, useEffect, useRef, useState } from 'react';
import {
  listarDepartamentosUbigeo,
  listarDistritosUbigeo,
  listarProvinciasUbigeo,
} from '../services/maestros';
import type { UbigeoNombres, UbigeoOpcion } from '../services/maestros';

interface UbigeoPickerProps {
  distritoId: number;
  onDistritoChange: (id: number) => void;
  sugerencia?: UbigeoNombres | null;
}

function normalizarNombre(nombre: string): string {
  return nombre.trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function buscarPorNombre(opciones: UbigeoOpcion[], nombre: string | null): UbigeoOpcion | undefined {
  if (!nombre) return undefined;
  const normalizado = normalizarNombre(nombre);
  return opciones.find((opcion) => normalizarNombre(opcion.nombre) === normalizado);
}

export function UbigeoPicker({ distritoId, onDistritoChange, sugerencia }: UbigeoPickerProps) {
  const [departamentos, setDepartamentos] = useState<UbigeoOpcion[]>([]);
  const [provincias, setProvincias] = useState<UbigeoOpcion[]>([]);
  const [distritos, setDistritos] = useState<UbigeoOpcion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departamentoId, setDepartamentoId] = useState(0);
  const [provinciaId, setProvinciaId] = useState(0);
  const sugerenciaAplicada = useRef<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [deps, provs, dists] = await Promise.all([
        listarDepartamentosUbigeo(),
        listarProvinciasUbigeo(),
        listarDistritosUbigeo(),
      ]);
      setDepartamentos(deps);
      setProvincias(provs);
      setDistritos(dists);
    } catch {
      setError('No fue posible cargar departamento, provincia y distrito.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  useEffect(() => {
    if (cargando || !distritoId) return;
    const distrito = distritos.find((opcion) => opcion.id === distritoId);
    const provincia = distrito ? provincias.find((opcion) => opcion.id === distrito.padreId) : undefined;
    if (provincia) {
      setProvinciaId(provincia.id);
      setDepartamentoId(provincia.padreId ?? 0);
    }
  }, [cargando, distritoId, distritos, provincias]);

  useEffect(() => {
    if (!sugerencia) {
      sugerenciaAplicada.current = null;
      return;
    }
    if (cargando) return;

    const clave = [
      sugerencia.departamento ?? '',
      sugerencia.provincia ?? '',
      sugerencia.distrito ?? '',
    ].join('|');
    if (sugerenciaAplicada.current === clave) return;
    sugerenciaAplicada.current = clave;

    const departamento = buscarPorNombre(departamentos, sugerencia.departamento);
    const provinciasFiltradas = departamento
      ? provincias.filter((opcion) => opcion.padreId === departamento.id)
      : provincias;
    const provincia = buscarPorNombre(provinciasFiltradas, sugerencia.provincia);
    const distritosFiltrados = provincia
      ? distritos.filter((opcion) => opcion.padreId === provincia.id)
      : distritos;
    const distritosCoincidentes = distritosFiltrados.filter(
      (opcion) => normalizarNombre(opcion.nombre) === normalizarNombre(sugerencia.distrito ?? ''),
    );
    const distrito = distritosCoincidentes.length === 1 ? distritosCoincidentes[0] : undefined;
    const provinciaDelDistrito = distrito
      ? provincias.find((opcion) => opcion.id === distrito.padreId)
      : undefined;

    setDepartamentoId(departamento?.id ?? provincia?.padreId ?? provinciaDelDistrito?.padreId ?? 0);
    setProvinciaId(provincia?.id ?? provinciaDelDistrito?.id ?? 0);
    const distritoSugeridoId = distrito?.id ?? 0;
    if (distritoId !== distritoSugeridoId) {
      onDistritoChange(distritoSugeridoId);
    }
  }, [cargando, departamentos, distritoId, distritos, onDistritoChange, provincias, sugerencia]);

  const provinciasDisponibles = provincias.filter((opcion) => opcion.padreId === departamentoId);
  const distritosDisponibles = distritos.filter((opcion) => opcion.padreId === provinciaId);
  const campoClase =
    'w-full rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[#A61E22] disabled:cursor-not-allowed disabled:opacity-60';

  if (error) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border border-[#DC2626]/30 bg-[#DC2626]/10 px-3.5 py-2.5 text-sm">
        <span className="text-xs text-[#7F1518]">{error}</span>
        <button
          type="button"
          onClick={() => void cargar()}
          className="shrink-0 rounded-lg bg-white px-3 py-1 text-xs font-bold shadow-sm hover:bg-[#F5F5F5]"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Departamento</span>
        <select
          value={departamentoId || ''}
          disabled={cargando}
          onChange={(event) => {
            setDepartamentoId(Number(event.target.value));
            setProvinciaId(0);
            onDistritoChange(0);
          }}
          className={campoClase}
        >
          <option value="">{cargando ? 'Cargando…' : 'Seleccione…'}</option>
          {departamentos.map((opcion) => (
            <option key={opcion.id} value={opcion.id}>{opcion.nombre}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Provincia</span>
        <select
          value={provinciaId || ''}
          disabled={cargando || !departamentoId}
          onChange={(event) => {
            setProvinciaId(Number(event.target.value));
            onDistritoChange(0);
          }}
          className={campoClase}
        >
          <option value="">Seleccione…</option>
          {provinciasDisponibles.map((opcion) => (
            <option key={opcion.id} value={opcion.id}>{opcion.nombre}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold tracking-wider uppercase opacity-60">Distrito</span>
        <select
          value={distritoId || ''}
          disabled={cargando || !provinciaId}
          onChange={(event) => onDistritoChange(Number(event.target.value))}
          className={campoClase}
        >
          <option value="">Seleccione…</option>
          {distritosDisponibles.map((opcion) => (
            <option key={opcion.id} value={opcion.id}>{opcion.nombre}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
