import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { Maestro } from '../services/maestros';

interface DistritoPickerProps {
  /** Id del distrito elegido (`0` = Otro / Sin especificar). */
  value: number;
  onChange: (id: number) => void;
  /** Lista viva desde `GET /maestros/distritos`. */
  distritos: Maestro[];
  cargando: boolean;
  error?: string | null;
  onReintentar?: () => void;
  disabled?: boolean;
  id?: string;
}

const OTRO: Maestro = { id: 0, nombre: 'Otro / Sin especificar' };

/** Normaliza para filtrar sin tildes ni mayúsculas. */
function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Combobox de distrito con buscador interno (primera fila del dropdown).
 * Teclado: escribir filtra · ↓/↑ mueve · Enter confirma · Escape revierte ·
 * Tab confirma. Valor `0` = Otro (= NULL en BD).
 */
export function DistritoPicker({
  value,
  onChange,
  distritos,
  cargando,
  error,
  onReintentar,
  disabled,
  id,
}: DistritoPickerProps) {
  const baseId = useId();
  const campoId = id ?? `${baseId}-campo`;
  const listaId = `${baseId}-lista`;
  const contRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState('');
  const [resaltado, setResaltado] = useState(0);

  const opciones = useMemo(() => {
    const q = normalizar(texto.trim());
    const filas = q ? distritos.filter((d) => normalizar(d.nombre).includes(q)) : distritos;
    return [OTRO, ...filas];
  }, [distritos, texto]);

  const elegido = value === 0 ? OTRO : (distritos.find((d) => d.id === value) ?? null);

  const abrir = () => {
    if (cargando || disabled) {
      return;
    }
    setTexto('');
    const idx = value === 0 ? 0 : distritos.findIndex((d) => d.id === value) + 1;
    setResaltado(Math.max(0, idx));
    setAbierto(true);
  };

  const cerrar = () => {
    setAbierto(false);
    setTexto('');
  };

  const confirmar = (idDistrito: number) => {
    onChange(idDistrito);
    cerrar();
  };

  // Foco al buscador al abrir.
  useEffect(() => {
    if (abierto) {
      inputRef.current?.focus();
    }
  }, [abierto ]);

  // Click fuera cierra (revierte: no confirma nada).
  useEffect(() => {
    if (!abierto) {
      return;
    }
    const fuera = (e: MouseEvent) => {
      if (contRef.current && !contRef.current.contains(e.target as Node)) {
        cerrar();
      }
    };
    document.addEventListener('mousedown', fuera);
    return () => document.removeEventListener('mousedown', fuera);
  }, [abierto]);

  // Mantiene visible la opción resaltada.
  useEffect(() => {
    if (!abierto) {
      return;
    }
    contRef.current
      ?.querySelector(`[data-opcion="${resaltado}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [resaltado, abierto]);

  const tecla = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (opciones.length === 0) {
        return;
      }
      const paso = e.key === 'ArrowDown' ? 1 : -1;
      setResaltado((r) => (r + paso + opciones.length) % opciones.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const op = opciones[resaltado];
      if (op) {
        confirmar(op.id);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cerrar();
    } else if (e.key === 'Tab') {
      const op = opciones[resaltado];
      if (op) {
        confirmar(op.id);
      } else {
        cerrar();
      }
    }
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
    <div ref={contRef} className="relative">
      <button
        id={campoId}
        type="button"
        disabled={disabled || cargando}
        onClick={() => (abierto ? cerrar() : abrir())}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg bg-[#F5F5F5] px-3.5 py-2.5 text-left text-sm outline-none transition-colors hover:bg-[#EFEFEF] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-1 focus-visible:ring-[#A61E22]"
      >
        <span className={elegido ? '' : 'text-[#333333]/50'}>
          {cargando ? 'Cargando distritos…' : (elegido?.nombre ?? 'Seleccionar distrito…')}
        </span>
        <span className="material-symbols-outlined text-[20px] text-[#333333]/50">
          {abierto ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {abierto && (
        <div className="absolute top-full right-0 left-0 z-30 mt-1 overflow-hidden rounded-xl border border-[#D9D9D9] bg-white shadow-xl">
          <div className="border-b border-[#F5F5F5] p-2">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined pointer-events-none absolute left-3 text-[18px] text-[#333333]/40">
                search
              </span>
              <input
                ref={inputRef}
                value={texto}
                onChange={(e) => {
                  setTexto(e.target.value);
                  setResaltado(0);
                }}
                onKeyDown={tecla}
                placeholder="Escribe para filtrar…"
                aria-label="Filtrar distritos"
                aria-controls={listaId}
                aria-activedescendant={`${listaId}-op-${resaltado}`}
                className="w-full rounded-lg bg-[#F5F5F5] py-2 pr-3 pl-9 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[#A61E22]"
              />
            </div>
          </div>
          <ul
            id={listaId}
            role="listbox"
            aria-label="Distritos"
            className="max-h-56 overflow-y-auto p-1"
          >
            {opciones.length === 0 ? (
              <li className="px-3 py-2.5 text-xs text-[#333333]/50">
                {texto.trim() ? `Sin coincidencias para '${texto.trim()}'` : 'Sin distritos.'}
              </li>
            ) : (
              opciones.map((op, i) => {
                const activo = i === resaltado;
                const actual = op.id === value;
                return (
                  <li
                    key={op.id}
                    id={`${listaId}-op-${i}`}
                    data-opcion={i}
                    role="option"
                    aria-selected={actual}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => confirmar(op.id)}
                    onMouseEnter={() => setResaltado(i)}
                    className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                      activo ? 'bg-[#A61E22]/10 text-[#7F1518]' : ''
                    }`}
                  >
                    <span className={op.id === 0 ? 'text-[#333333]/60 italic' : 'font-medium'}>
                      {op.nombre}
                    </span>
                    {actual && (
                      <span className="material-symbols-outlined text-[18px] text-[#A61E22]">check</span>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
