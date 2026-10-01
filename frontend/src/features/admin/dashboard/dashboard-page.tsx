import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/login/auth-context';
import { resumenDashboard } from './dashboard-service';
import type { DashboardResumen, DonaItem, PuntoDia } from './dashboard-types';

/** Foto del banner servida desde public/ (sin dependencia externa). */
const HERO_IMG = '/img/fachada-yemheng.png';

/** /admin — Dashboard (dashboard.md + plantilla Stitch, gráficos SVG Opción A). */
export function DashboardPage() {
  const { usuario } = useAuth();
  const [datos, setDatos] = useState<DashboardResumen | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actualizado, setActualizado] = useState<string>('');
  const [refrescando, setRefrescando] = useState(false);

  const refrescar = () => {
    setRefrescando(true);
    resumenDashboard()
      .then((d) => {
        setDatos(d);
        setError(null);
        setActualizado(new Date().toLocaleTimeString('es-PE'));
      })
      .catch(() => setError('No fue posible cargar el panel.'))
      .finally(() => setRefrescando(false));
  };

  useEffect(() => {
    let vivo = true;
    const cargar = () => {
      resumenDashboard()
        .then((d) => {
          if (vivo) {
            setDatos(d);
            setError(null);
            setActualizado(new Date().toLocaleTimeString('es-PE'));
          }
        })
        .catch(() => {
          if (vivo) {
            setError('No fue posible cargar el panel.');
          }
        });
    };
    cargar();
    const id = setInterval(cargar, 30000);
    return () => {
      vivo = false;
      clearInterval(id);
    };
  }, []);

  const nombre = usuario?.empleado?.split(' ')[0] || usuario?.logeo || '';
  const hoy = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (error) {
    return (
      <div className="rounded-xl bg-white p-10 text-center shadow-sm">
        <p>{error}</p>
      </div>
    );
  }

  if (!datos) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-44 animate-pulse rounded-xl bg-white shadow-sm" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-white shadow-sm" />
          ))}
        </div>
      </div>
    );
  }

  const ocupPct =
    datos.mesas.total > 0 ? Math.round((datos.mesas.ocupadas / datos.mesas.total) * 100) : 0;
  const ticket =
    datos.ventasHoy.comandas > 0 ? datos.ventasHoy.total / datos.ventasHoy.comandas : 0;

  return (
    <div className="flex w-full flex-col gap-6 pb-12">
      <section className="w-full rounded-2xl border border-[#EADBCE] bg-gradient-to-r from-white via-[#FFFDF9] to-[#FBF2E0] p-4 shadow-xl transition-all duration-300 hover:shadow-2xl sm:p-6 lg:p-7 dark:border-white/10 dark:from-[#241010] dark:via-[#241010] dark:to-[#3a1414]">
        <div className="flex flex-col items-stretch gap-6 lg:flex-row lg:items-center lg:gap-8">
          <div className="flex w-full min-w-0 flex-col justify-center lg:w-[36%] lg:min-w-[320px] lg:shrink-0">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B8860B]" />
              <p className="text-[11px] font-bold tracking-widest text-[#9E7311] uppercase sm:text-xs">
                Chifa Yemheng · Operación Central
              </p>
            </div>
            <h1 className="mb-1.5 font-[Newsreader] text-2xl leading-snug font-bold tracking-tight text-[#1C1917] sm:text-3xl lg:text-[30px] dark:text-white">
              <span className="text-[#83000F]">¡Bienvenido, {nombre}!</span>
              <br className="hidden sm:inline" /> Sistema de Gestión Chifa Yemheng
            </h1>
            <p className="mb-3 text-xs leading-relaxed font-normal text-pretty text-[#57534E] dark:text-white/70">
              Salones, comandas de mesas, catálogo de productos, inventario crítico y personal en vivo,
              desde una sola plataforma inteligente.
            </p>
            <p className="mb-4 text-base font-semibold text-[#57534E] dark:text-white/70">{hoy}</p>
            <button
              type="button"
              onClick={refrescar}
              disabled={refrescando}
              title="Actualizar ahora"
              aria-label="Actualizar ahora"
              className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-full bg-[#F4EDE2]/80 px-3 py-1.5 text-[11px] whitespace-nowrap text-[#57534E] transition-colors hover:bg-[#E8DCC8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A61E22]/50 disabled:cursor-progress disabled:opacity-70 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/20"
            >
              <span
                className={`h-2 w-2 rounded-full bg-emerald-500 ${refrescando ? 'animate-none opacity-50' : 'animate-pulse'}`}
              />
              <span>
                {refrescando
                  ? 'Actualizando…'
                  : actualizado
                    ? `Actualizado ${actualizado} · cada 30s`
                    : 'Sincronizando datos…'}
              </span>
            </button>
          </div>

          <div className="group relative h-[160px] w-full min-w-0 shrink overflow-hidden rounded-xl border border-[#E6D7C3] bg-gradient-to-br from-[#A61E22] to-[#7F1518] shadow-md sm:h-[180px] lg:h-[220px] dark:border-white/10">
            <img
              src={HERO_IMG}
              alt="Chifa Yemheng - Sede y Salón"
              className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
          </div>

          <div className="flex w-full shrink-0 flex-col justify-between rounded-xl border border-[#E5DAC8] bg-[#F4EDE2]/80 p-4 shadow-sm transition-all hover:border-[#D5C7B3] sm:p-5 lg:w-[300px] lg:shrink-0 xl:w-[320px] dark:border-white/10 dark:bg-white/5">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-[#83000F] uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-[#83000F]" />
                Filosofía Gastronómica
              </span>
              <span className="font-[Newsreader] text-3xl leading-none text-[#B8860B]/70 select-none">
                “
              </span>
            </div>
            <blockquote className="relative z-10 mb-3 font-[Newsreader] text-[13px] leading-relaxed text-[#1C1917] italic sm:text-[14px] dark:text-white/90">
              “Tradición milenaria, sabor peruano y maestría en cada mesa. La excelencia de hoy se cocina
              con pasión y fuego en el wok.”
            </blockquote>
            <div className="flex items-center justify-between border-t border-[#E6D7C3]/80 pt-2 text-[11px]">
              <span className="font-bold tracking-wider text-[#795900] uppercase">Chifa Yemheng</span>
              <span className="text-[10px] font-medium tracking-wide text-[#57534E] uppercase dark:text-white/60">
                Tradición Dinastía
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          titulo="Ventas del Día"
          valor={`S/. ${datos.ventasHoy.total.toFixed(2)}`}
          detalle={`${datos.ventasHoy.comandas} comandas · S/. ${ticket.toFixed(2)} ticket`}
          icono="payments"
        />
        <Kpi
          titulo="Pedidos Activos"
          valor={String(datos.pedidos.activos)}
          detalle={`Abiertos ${datos.pedidos.abiertos} · Cocina ${datos.pedidos.cocina} · Por cobrar ${datos.pedidos.porCobrar}`}
          icono="skillet"
        />
        <Kpi
          titulo="Mesas Ocupadas"
          valor={`${datos.mesas.ocupadas} / ${datos.mesas.total}`}
          detalle={`${ocupPct}% ocupación`}
          icono="table_restaurant"
        />
        <Kpi
          titulo="Reservas Pendientes"
          valor={String(datos.reservasPendientes)}
          detalle="Por confirmar"
          icono="notifications_active"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-7">
          <span className="text-[11px] font-bold tracking-widest text-[#A61E22] uppercase">
            Rendimiento por día
          </span>
          <h2 className="text-xl font-medium">Ventas últimos 14 días</h2>
          <BarrasDiaChart puntos={datos.ventasDia} />
        </div>
        <div className="flex flex-col rounded-xl bg-white p-6 shadow-sm lg:col-span-5">
          <span className="text-[11px] font-bold tracking-widest text-[#D4A017] uppercase">
            Preferencia Culinaria
          </span>
          <h2 className="text-xl font-medium">Platos más vendidos</h2>
          <DonaChart items={datos.donaPlatos} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-7">
          <span className="text-[11px] font-bold tracking-widest text-[#D4A017] uppercase">
            Flujo Operativo
          </span>
          <h2 className="text-xl font-medium">Pedidos por etapa · {datos.pedidos.activos} activos</h2>
          <BarrasPedidosChart
            abiertos={datos.pedidos.abiertos}
            cocina={datos.pedidos.cocina}
            porCobrar={datos.pedidos.porCobrar}
          />
        </div>
        <div className="flex flex-col rounded-xl bg-white p-6 shadow-sm lg:col-span-5">
          <span className="text-[11px] font-bold tracking-widest text-[#A61E22] uppercase">
            Salón en vivo
          </span>
          <h2 className="text-xl font-medium">Ocupación</h2>
          <GaugeOcupacionChart ocupadas={datos.mesas.ocupadas} total={datos.mesas.total} pct={ocupPct} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-7">
          <span className="text-[11px] font-bold tracking-widest text-[#A61E22] uppercase">
            Salón &amp; Despacho
          </span>
          <h2 className="mb-4 text-xl font-medium">Últimas ventas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#F5F5F5] text-[11px] tracking-wider text-[#333333]/60 uppercase">
                  <th className="rounded-l px-3 py-2.5">N° Comprobante</th>
                  <th className="px-3 py-2.5">Cliente</th>
                  <th className="px-3 py-2.5">Fecha/Hora</th>
                  <th className="px-3 py-2.5 text-right">Total</th>
                  <th className="rounded-r px-3 py-2.5 text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {datos.ultimasVentas.map((v) => (
                  <tr key={v.comprobante} className="transition-colors hover:bg-[#F5F5F5]">
                    <td className="px-3 py-3 font-semibold text-[#A61E22]">{v.comprobante}</td>
                    <td className="px-3 py-3 font-medium">{v.cliente}</td>
                    <td className="px-3 py-3 text-[#333333]/60">{v.fecha}</td>
                    <td className="px-3 py-3 text-right font-bold">S/. {v.total.toFixed(2)}</td>
                    <td className="px-3 py-3 text-center">
                      <EstadoBadge estado={v.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {datos.ultimasVentas.length === 0 && (
              <p className="py-4 text-center text-sm text-[#333333]/60">Sin ventas registradas.</p>
            )}
          </div>
        </div>
        <div className="flex flex-col rounded-xl bg-white p-6 shadow-sm lg:col-span-5">
          <span className="text-[11px] font-bold tracking-widest text-[#DC2626] uppercase">
            Almacén &amp; Wok
          </span>
          <h2 className="mb-4 text-xl font-medium">Stock bajo</h2>
          <div className="flex flex-col gap-2">
            {datos.stockBajo.map((s) => (
              <div
                key={s.producto}
                className="flex items-center justify-between rounded-lg bg-[#F5F5F5] p-2.5"
              >
                <span className="text-sm font-semibold">{s.producto}</span>
                <span className="text-right text-xs">
                  <strong className="text-[#DC2626]">{s.actual}</strong>
                  <span className="text-[#333333]/60"> · {s.minimo}</span>
                </span>
              </div>
            ))}
            {datos.stockBajo.length === 0 && (
              <p className="text-sm text-[#333333]/60">Sin alertas de stock.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ titulo, valor, detalle, icono }: { titulo: string; valor: string; detalle: string; icono: string }) {
  return (
    <div className="flex flex-col justify-between rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-[11px] font-medium tracking-wider text-[#333333]/60 uppercase">{titulo}</span>
          <span className="mt-1 text-3xl font-bold">{valor}</span>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#A61E22]/10 text-[#A61E22]">
          <span className="material-symbols-outlined"> {icono} </span>
        </div>
      </div>
      <span className="mt-3 text-sm text-[#333333]/60">{detalle}</span>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const e = estado.toLowerCase();
  if (e.includes('cancel')) {
    return (
      <span className="inline-block rounded-full bg-[#DC2626]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#DC2626]">
        {estado}
      </span>
    );
  }
  if (e.includes('proceso')) {
    return (
      <span className="inline-block rounded-full bg-[#F2C94C]/30 px-2.5 py-0.5 text-[11px] font-bold text-[#795900]">
        {estado}
      </span>
    );
  }
  return (
    <span className="inline-block rounded-full bg-[#F2C94C]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#795900]">
      {estado}
    </span>
  );
}

/** Barras verticales ventas por día últimos 14 días (SVG sin librerías, sin hardcode). */
function BarrasDiaChart({ puntos }: { puntos: PuntoDia[] }) {
  const W = 640;
  const H = 200;
  if (puntos.length === 0 || puntos.every((p) => p.total <= 0)) {
    return <p className="py-8 text-center text-sm text-[#333333]/60">Sin ventas en el rango.</p>;
  }
  const max = Math.max(...puntos.map((p) => p.total), 1);
  const n = puntos.length;
  const bw = Math.min(30, (W - 20) / n - 6);
  const gap = (W - 20 - bw * n) / Math.max(n - 1, 1);
  const pico = puntos.reduce((a, b) => (b.total > a.total ? b : a), puntos[0] ?? { dia: '', total: 0 });
  return (
    <svg className="h-56 w-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img">
      <title>Ventas por día</title>
      {[40, 90, 140].map((y) => (
        <line key={y} x1="0" x2={W} y1={y} y2={y} stroke="#f0eded" strokeDasharray="4 4" strokeWidth="1" />
      ))}
      {puntos.map((p, i) => {
        const h = (p.total / max) * (H - 60);
        const x = 10 + i * (bw + gap);
        const y = H - 25 - h;
        const esPico = p.dia === pico.dia && p.total > 0;
        return (
          <g key={`${p.dia}-${i}`}>
            <rect x={x} y={y} width={bw} height={Math.max(h, 2)} rx="4" fill={esPico ? '#A61E22' : '#F2C94C'} />
            <text x={x + bw / 2} y={H - 8} textAnchor="middle" fontSize="9" fill="#5a413e">
              {p.dia}
            </text>
            {p.total > 0 && (
              <text x={x + bw / 2} y={y - 5} textAnchor="middle" fontSize="9" fontWeight="700" fill="#5a413e">
                {p.total >= 1000 ? `${Math.round(p.total / 1000)}k` : p.total}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Dona SVG data-driven (Opción A, sin librerías). */
function DonaChart({ items }: { items: DonaItem[] }) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-[#333333]/60">Sin datos de platos.</p>;
  }
  const R = 38;
  const CIRC = 2 * Math.PI * R;
  let offset = 0;
  const segs = items.map((it) => {
    const len = (it.pct / 100) * CIRC;
    const s = { ...it, len, offset };
    offset -= len;
    return s;
  });
  const total = items.reduce((acc, it) => acc + it.pct, 0);

  return (
    <div className="flex flex-col items-center justify-center gap-4 pt-3 sm:flex-row">
      <div className="relative flex h-44 w-44 flex-shrink-0 items-center justify-center">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" role="img">
          <title>Platos más vendidos</title>
          {segs.map((s) => (
            <circle
              key={s.nombre}
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="12"
              strokeDasharray={`${s.len} ${CIRC}`}
              strokeDashoffset={s.offset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
          <span className="text-xl font-bold">{total}%</span>
          <span className="text-[10px] tracking-wider text-[#333333]/60 uppercase">Top platos</span>
        </div>
      </div>
      <div className="flex w-full flex-col gap-1.5">
        {items.map((it) => (
          <div key={it.nombre} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: it.color }} />
              <span className="font-medium">{it.nombre}</span>
            </span>
            <span className="font-bold">{it.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Barras horizontales pedidos por etapa (SVG/div sin librerías). */
function BarrasPedidosChart({ abiertos, cocina, porCobrar }: { abiertos: number; cocina: number; porCobrar: number }) {
  const max = Math.max(abiertos, cocina, porCobrar, 1);
  const filas = [
    { label: 'Abiertos', valor: abiertos, color: '#2563EB', ayuda: 'Recién abiertos, sin enviar a wok' },
    { label: 'Cocina', valor: cocina, color: '#A61E22', ayuda: 'En preparación' },
    { label: 'Por cobrar', valor: porCobrar, color: '#D4A017', ayuda: 'Servido, esperando cuenta' },
  ];
  return (
    <div className="flex flex-col gap-3 pt-4">
      {filas.map((f) => (
        <div key={f.label}>
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-semibold">
              {f.label} <span className="font-normal text-[#333333]/50">· {f.ayuda}</span>
            </span>
            <strong>{f.valor}</strong>
          </div>
          <div className="mt-1 h-3 overflow-hidden rounded-full bg-[#F5F5F5]">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.round((f.valor / max) * 100)}%`, backgroundColor: f.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Gauge ocupación salón (dona única SVG). */
function GaugeOcupacionChart({ ocupadas, total, pct }: { ocupadas: number; total: number; pct: number }) {
  const R = 38;
  const CIRC = 2 * Math.PI * R;
  const len = (Math.min(pct, 100) / 100) * CIRC;
  const libres = Math.max(total - ocupadas, 0);
  return (
    <div className="flex flex-col items-center justify-center gap-3 pt-3">
      <div className="relative flex h-44 w-44 items-center justify-center">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" role="img">
          <title>Ocupación del salón</title>
          <circle cx="50" cy="50" r={R} fill="none" stroke="#F5F5F5" strokeWidth="12" />
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="#A61E22"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${len} ${CIRC}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold">{pct}%</span>
          <span className="text-[11px] text-[#333333]/60">
            {ocupadas}/{total} mesas
          </span>
        </div>
      </div>
      <span className="text-sm">
        <strong className="text-[#28A745]">{libres} libres</strong>
        <span className="text-[#333333]/60"> · {ocupadas} ocupadas</span>
      </span>
    </div>
  );
}
