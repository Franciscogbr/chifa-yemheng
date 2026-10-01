import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type Tema = 'claro' | 'oscuro';
const TEMA_KEY = 'chifa.tema';

function temaInicial(): Tema {
  try {
    return localStorage.getItem(TEMA_KEY) === 'oscuro' ? 'oscuro' : 'claro';
  } catch {
    return 'claro';
  }
}

interface ThemeValue {
  tema: Tema;
  cambiarTema: (t: Tema) => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(temaInicial);

  useEffect(() => {
    const raiz = document.documentElement;
    raiz.classList.toggle('dark', tema === 'oscuro');
    try {
      localStorage.setItem(TEMA_KEY, tema);
    } catch {
      /* sin almacenamiento */
    }
  }, [tema]);

  const cambiarTema = useCallback((t: Tema) => setTema(t), []);
  const value = useMemo(() => ({ tema, cambiarTema }), [tema, cambiarTema]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return ctx;
}
