import { useMemo, useState } from 'react';
import { Button } from './Button';

interface TablaReporteProps {
  /** Etiquetas de cabecera de la tabla. */
  columnas: string[];
  /** Filas de datos. Cada celda puede ser texto o un nodo React (p. ej. un Badge). */
  filas: React.ReactNode[][];
  /** Mensaje mostrado cuando no hay filas. */
  mensajeVacio: string;
  /** Nota opcional mostrada encima de la tabla. */
  nota?: string;
  /** Índices de columna cuyo contenido se alinea a la derecha (números, montos). */
  alinearDerecha?: number[];
  /** Opciones de filas por página. Por defecto [10, 25, 50, 100]. */
  filasPorPaginaOpciones?: number[];
  /** Filas mostradas por página. Por defecto 25. */
  filasPorPaginaInicial?: number;
}

export function TablaReporte({
  columnas,
  filas,
  mensajeVacio,
  nota,
  alinearDerecha = [],
  filasPorPaginaOpciones = [10, 25, 50, 100],
  filasPorPaginaInicial = 25,
}: TablaReporteProps) {
  const [pagina, setPagina] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(filasPorPaginaInicial);

  const totalPaginas = Math.max(1, Math.ceil(filas.length / filasPorPagina));
  const paginaSegura = Math.min(Math.max(pagina, 1), totalPaginas);

  // Sincronizar página si el tamaño de página cambia y la actual queda fuera de rango.
  useMemo(() => {
    if (paginaSegura > totalPaginas) setPagina(totalPaginas);
  }, [filasPorPagina, filas.length, totalPaginas, paginaSegura]);

  const desde = (paginaSegura - 1) * filasPorPagina;
  const hasta = desde + filasPorPagina;
  const filasPagina = filas.slice(desde, hasta);
  const alinear = new Set(alinearDerecha);

  return (
    <div className="overflow-x-auto border rounded-xl border-[#E5E5E5] bg-white shadow-sm">
      {nota && (
        <p className="mx-4 mt-3 mb-2 text-xs text-[#333]/60">{nota}</p>
      )}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-[#F5F5F5] text-left text-xs uppercase tracking-wider text-[#333]/60 border-b border-[#E5E5E5]">
            {columnas.map((columna) => (
              <th
                key={columna}
                className={`px-4 py-3 font-semibold ${
                  alinear.has(columnas.indexOf(columna)) ? 'text-right' : ''
                }`}
              >
                {columna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F2F2F2]">
          {filasPagina.length === 0 ? (
            <tr>
              <td
                colSpan={columnas.length}
                className="px-4 py-8 text-center text-sm text-[#333]/60"
              >
                {mensajeVacio}
              </td>
            </tr>
          ) : (
            filasPagina.map((fila, filaIndex) => (
              <tr
                key={filaIndex}
                className={`
                  hover:bg-[#F7F7F7] transition-colors
                  ${filaIndex % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'}
                `}
              >
                {fila.map((celda, celdaIndex) => (
                  <td
                    key={celdaIndex}
                    className={`px-4 py-3 ${
                      alinear.has(celdaIndex) ? 'text-right font-mono text-[#333]' : ''
                    }`}
                  >
                    {celda}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {filas.length > 0 && (
        <div className="border-t border-[#E5E5E5] bg-[#F9F9F9] px-4 py-3 flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap">
          <p className="text-xs text-[#333]/70">
            Mostrando{' '}
            <strong>{desde + 1}</strong>{' '}
            a{' '}
            <strong>{Math.min(hasta, filas.length)}</strong>{' '}
            de <strong>{filas.length.toLocaleString('es-PE')}</strong> registros
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#333]/60">Por página:</span>
            <select
              value={filasPorPagina}
              onChange={(e) => {
                setFilasPorPagina(Number(e.target.value));
                setPagina(1);
              }}
              className="rounded-lg border border-[#E5E5E5] bg-white px-2 py-1 text-xs text-[#333] focus:border-[#A61E22] focus:ring-1 focus:ring-[#A61E22]/30 outline-none"
            >
              {filasPorPaginaOpciones.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={paginaSegura <= 1 || filas.length === 0}
              onClick={() => setPagina(paginaSegura - 1)}
            >
              Anterior
            </Button>
            <span className="px-2 text-xs text-[#333]/60 font-mono">
              {paginaSegura} / {totalPaginas}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={paginaSegura >= totalPaginas || filas.length === 0}
              onClick={() => setPagina(paginaSegura + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
