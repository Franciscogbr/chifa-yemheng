import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Producto } from '../types/db';

const IGV_RATE = 0.18;
const MESA_SESSION_KEY = 'chifa.cliente.mesa';
const ITEMS_SESSION_KEY = 'chifa.cliente.items';

export interface CartItem { producto: Producto; cantidad: number; nota: string; }
interface CartState {
  items: CartItem[];
  mesaId: string;
  setMesaId: (v: string) => void;
  add: (p: Producto, cantidad?: number, nota?: string) => void;
  remove: (id: number) => void;
  setQty: (id: number, q: number) => void;
  setNota: (id: number, n: string) => void;
  clear: () => void;
  subtotal: number;
  igv: number;
  total: number;
  count: number;
}
const Ctx = createContext<CartState>({} as CartState);
export const useCart = () => useContext(Ctx);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = sessionStorage.getItem(ITEMS_SESSION_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [mesaId, setMesaIdState] = useState(() => sessionStorage.getItem(MESA_SESSION_KEY) ?? '');
  useEffect(() => {
    const limpiarSesion = () => {
      setItems([]);
      setMesaIdState('');
      sessionStorage.removeItem(MESA_SESSION_KEY);
      sessionStorage.removeItem(ITEMS_SESSION_KEY);
    };
    window.addEventListener('cliente:limpiar-sesion', limpiarSesion);
    return () => window.removeEventListener('cliente:limpiar-sesion', limpiarSesion);
  }, []);
  // Persistir items cada vez que cambien
  useEffect(() => {
    sessionStorage.setItem(ITEMS_SESSION_KEY, JSON.stringify(items));
  }, [items]);
  const setMesaId = useCallback((value: string) => {
    const mesa = value.trim();
    setMesaIdState(mesa);
    if (mesa) {
      sessionStorage.setItem(MESA_SESSION_KEY, mesa);
    } else {
      sessionStorage.removeItem(MESA_SESSION_KEY);
    }
  }, []);
  const add: CartState['add'] = useCallback((p, cantidad = 1, nota = '') => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.producto.id_producto === p.id_producto);
      if (i >= 0) {
        const c = [...prev];
        c[i] = { ...c[i], cantidad: c[i].cantidad + cantidad, nota: nota || c[i].nota };
        return c;
      }
      return [...prev, { producto: p, cantidad, nota }];
    });
  }, []);
  const remove: CartState['remove'] = (id) => setItems((p) => p.filter((x) => x.producto.id_producto !== id));
  const setQty: CartState['setQty'] = (id, q) => {
    setItems((p) => {
      if (q <= 0) return p.filter((x) => x.producto.id_producto !== id);
      return p.map((x) => (x.producto.id_producto === id ? { ...x, cantidad: q } : x));
    });
  };
  const setNota: CartState['setNota'] = (id, n) => {
    setItems((p) => p.map((x) => (x.producto.id_producto === id ? { ...x, nota: n } : x)));
  };
  const clear = useCallback(() => {
    setItems([]);
    sessionStorage.removeItem(ITEMS_SESSION_KEY);
  }, []);
  const { subtotal, igv, total, count } = useMemo(() => {
    const total = items.reduce((s, x) => s + x.cantidad * Number(x.producto.precio), 0);
    const subtotal = total / (1 + IGV_RATE);
    const igv = total - subtotal;
    const count = items.reduce((s, x) => s + x.cantidad, 0);
    return { subtotal, igv, total, count };
  }, [items]);
  return <Ctx.Provider value={{ items, mesaId, setMesaId, add, remove, setQty, setNota, clear, subtotal, igv, total, count }}>{children}</Ctx.Provider>;
}
