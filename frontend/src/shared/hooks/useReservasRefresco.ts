import { useCallback, useEffect, useRef, useState } from 'react';

export function useReservasRefresco(cargar: () => Promise<void>, intervaloMs = 10000) {
  const [refrescando, setRefrescando] = useState(false);
  const ejecutando = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);

  const refrescar = useCallback(async () => {
    if (ejecutando.current) return;
    ejecutando.current = true;
    const ctrl = new AbortController();
    controllerRef.current = ctrl;
    setRefrescando(true);
    try {
      await cargar();
    } catch {
      // Los errores se manejan dentro de cargar(); no romper el ciclo de refresco.
    } finally {
      if (!ctrl.signal.aborted) {
        ejecutando.current = false;
        setRefrescando(false);
        controllerRef.current = null;
      }
    }
  }, [cargar]);

  useEffect(() => {
    const timer = window.setInterval(() => void refrescar(), intervaloMs);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void refrescar();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      controllerRef.current?.abort();
    };
  }, [refrescar, intervaloMs]);

  return { refrescando, refrescar };
}
