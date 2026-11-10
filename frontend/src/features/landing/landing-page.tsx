import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ico } from '../../components/Icon';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ScanLine, ClipboardList, HandPlatter, ChefHat, Smile, ArrowRight, ShieldCheck, Zap, Flame, MapPin, Phone, Clock, MessageCircle } from 'lucide-react';

const HERO_IMG = '/img/fachada-yemheng.webp';
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1';

interface ProductoLanding {
  id: number;
  nombre: string;
  precio: number;
  disponible: boolean;
  imagen: string | null;
  detalle: string | null;
  estado: string;
}

const steps = [[ScanLine, 'Escanea'], [ClipboardList, 'Elige'], [HandPlatter, 'Pide'], [ChefHat, 'Cocina'], [Smile, 'Disfruta']] as const;
const lines = [['El', 'sabor', 'del', 'wok'], ['en', 'tu', 'mesa,']];
const how = [
  [ScanLine, 'Escanea', 'El QR de tu mesa te abre la carta al instante.'],
  [ShieldCheck, 'Identifícate', 'Inicia sesión con Google para continuar tu pedido.'],
  [Zap, 'Elige y confirma', 'Revisa la disponibilidad y confirma tu selección.'],
  [Flame, 'Cocina y disfruta', 'Sigue tu pedido en vivo hasta que llegue a tu mesa.'],
] as const;

const word = { hidden: { y: 46, opacity: 0, rotate: 2 }, show: (i: number) => ({ y: 0, opacity: 1, rotate: 0, transition: { delay: 0.25 + i * 0.09, duration: 0.7, ease: [0.2, 0.7, 0.2, 1] as const } }) };
const up = (d = 0) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.6 } });

export default function Landing() {
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 700], [0, 140]);
  const textY = useTransform(scrollY, [0, 500], [0, -40]);
  const [platos, setPlatos] = useState<ProductoLanding[]>([]);
  const [loadingPlatos, setLoadingPlatos] = useState(true);
  const [errorPlatos, setErrorPlatos] = useState(false);
  let n = 0;

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/productos?limit=100&estado=A&disponible=S`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('No se pudo cargar la carta.');
        return response.json() as Promise<{ data?: ProductoLanding[] } | ProductoLanding[]>;
      })
      .then((body) => {
        const list = Array.isArray(body) ? body : body.data;
        if (!Array.isArray(list)) throw new Error('La respuesta de la carta no es válida.');
        setPlatos(list.filter((producto) => producto.disponible && producto.estado === 'A').slice(0, 100));
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) return;
        setErrorPlatos(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingPlatos(false);
      });

    return () => controller.abort();
  }, []);

  const productosVisibles = platos.slice(0, 6);
  const franjaProductos = [...platos.slice(0, 6), ...platos.slice(0, 6)];

  return (
    <div className="y-shell y-landing-page">
      {/* Hero */}
      <section className="y-hero" aria-labelledby="landing-hero-title">
        <motion.div className="bg" style={{ backgroundImage: `url("${HERO_IMG}")`, y: bgY }} aria-hidden="true" initial={{ scale: 1.18 }} animate={{ scale: 1.05 }} transition={{ duration: 2.4, ease: 'easeOut' }} />
        <div className="fade" aria-hidden="true" />
        <div className="y-embers" aria-hidden="true">
          {Array.from({ length: 22 }, (_, i) => (
            <span key={i} className="y-ember" style={{ left: `${(i * 37 + 11) % 100}%`, width: 2 + (i % 3) * 2, height: 2 + (i % 3) * 2, animationDuration: `${6 + (i % 5) * 1.7}s`, animationDelay: `${(i * 0.7) % 8}s` }} />
          ))}
        </div>

        <motion.div className="y-landing-hero-content" style={{ y: textY }}>
          <div style={{ maxWidth: 580 }}>
            <motion.span {...up(0)} className="y-chip" style={{ background: 'rgba(201,164,92,.12)', color: 'var(--gold2)', border: '1px solid var(--line)', marginBottom: 18 }}><Ico n="chop" /> CHIFA CONTEMPORÁNEO</motion.span>
            <h1 id="landing-hero-title">
              {lines.map((l, li) => (
                <span key={li} style={{ display: 'block' }}>
                  {l.map((w) => <motion.span key={w + n} custom={n++} variants={word} initial="hidden" animate="show" style={{ display: 'inline-block', marginRight: '.26em' }}>{w}</motion.span>)}
                </span>
              ))}
              <span style={{ display: 'block' }}>
                {['sin', 'esperar', 'al', 'mozo.'].map((w) => <motion.em key={w} custom={n++} variants={word} initial="hidden" animate="show" style={{ display: 'inline-block', marginRight: '.26em' }}>{w}</motion.em>)}
              </span>
            </h1>
            <motion.p {...up(1)} style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6, margin: '20px 0 0', maxWidth: 420 }}>
              Escanea el QR de tu mesa, elige, pide y disfruta. Así de simple. Así de Yemheng.
            </motion.p>
            <motion.div {...up(1.05)} className="y-landing-hero-actions">
              <Link className="y-landing-cta" to="/cliente/menu">
                Ver la carta <ArrowRight size={18} />
              </Link>
              <Link className="y-landing-cta-secondary" to="/cliente/delivery">
                Pedir delivery
              </Link>
            </motion.div>
            <div className="y-steps">
              {steps.map(([Icon, t], i) => (
                <motion.div key={t} {...up(1.15 + i * 0.12)} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <div className="y-step" style={{ ['--d' as string]: `${i * 0.5}s` }}><i><Icon size={22} /></i>{t}</div>
                  {i < steps.length - 1 && <ArrowRight size={14} className="y-arrow" />}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
        <div className="y-scroll" />
      </section>

      {franjaProductos.length > 0 && (
        <div className="y-marquee" aria-label="Platos disponibles en la carta">
          <div className="t">
            {franjaProductos.map((producto, i) => (
              <span key={`${producto.id}-${i}`}>
                {producto.nombre} <span style={{ color: 'var(--red2)', marginLeft: 46 }}><Ico n="spark" /></span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Productos disponibles */}
      {loadingPlatos ? (
        <section className="y-landing-section" aria-live="polite">
          <p className="y-landing-status">Cargando la carta…</p>
        </section>
      ) : errorPlatos ? (
        <section className="y-landing-section" aria-live="polite">
          <div className="y-panel y-landing-status" role="status">
            No se pudo cargar la carta. Puedes volver a intentarlo desde la sección Carta.
            <Link className="y-btn red sm" to="/cliente/menu">Abrir carta</Link>
          </div>
        </section>
      ) : productosVisibles.length === 0 ? (
        <section className="y-landing-section" aria-live="polite">
          <div className="y-panel y-landing-status">No hay productos disponibles en la carta por el momento.</div>
        </section>
      ) : (
        <section className="y-landing-section">
          <motion.div className="y-landing-section-heading" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-d" style={{ fontSize: 32, margin: '0 0 6px' }}>Disponibles en la carta</h2>
            <p style={{ color: 'var(--muted)', marginTop: 0 }}>Una muestra de los productos disponibles actualmente.</p>
          </motion.div>
          <div className="y-landing-dishes">
            {productosVisibles.map((p, i) => (
              <motion.div key={p.id} className="y-dish y-panel" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                {p.imagen ? (
                  <img src={p.imagen} alt={p.nombre} loading="lazy" decoding="async" />
                ) : (
                  <div className="y-ph" role="img" aria-label={`Imagen no disponible para ${p.nombre}`} />
                )}
                <div className="b">
                  <b style={{ fontSize: 14 }}>{p.nombre}</b>
                  {p.detalle && <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.4 }}>{p.detalle}</p>}
                  <div className="row">
                    <span className="y-price">S/ {Number(p.precio).toFixed(2)}</span>
                    <Link to="/cliente/menu" className="y-plus" aria-label={`Ver carta para pedir ${p.nombre}`}><ArrowRight size={17} /></Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Sobre Yemheng */}
      <section className="y-landing-section y-landing-section--compact">
        <div className="y-feature y-panel y-landing-about">
          <div className="tx">
            <span className="y-chip" style={{ background: 'rgba(201,164,92,.12)', color: 'var(--gold2)', border: '1px solid var(--line)', alignSelf: 'flex-start' }}><Ico n="chop" /> TU EXPERIENCIA</span>
            <h2 className="font-d" style={{ fontSize: 28, margin: '8px 0 4px' }}>Una forma más simple de pedir</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              Consulta la carta, agrega platos a tu carrito y envía la comanda a cocina. Si estás en una mesa, también puedes seguir el pedido desde tu celular.
            </p>
            <Link className="y-btn red" to="/cliente/menu" style={{ alignSelf: 'flex-start', marginTop: 8 }}>Conocer la carta</Link>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="y-landing-section">
        <motion.div className="y-landing-section-heading" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-d" style={{ fontSize: 32, margin: '0 0 6px' }}>Pide sin esperar</h2>
          <p style={{ color: 'var(--muted)', marginTop: 0 }}>Cuatro pasos entre tú y el wok.</p>
        </motion.div>
        <div className="y-landing-how">
          {how.map(([Icon, t, d], i) => (
            <motion.div key={t} className="y-panel y-how" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: i * 0.12, duration: 0.55 }}>
              <div className="ic"><Icon size={22} /></div><h3 style={{ margin: '0 0 6px', fontSize: 16 }}>{t}</h3><p style={{ color: 'var(--muted)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>{d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="y-landing-section y-landing-final-cta">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-d" style={{ fontSize: 32, margin: '0 0 8px' }}>¿Listo para pedir?</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 20 }}>Escanea el QR de tu mesa o pide delivery desde tu celular.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link className="y-btn red" to="/cliente/menu">Ver la carta</Link>
            <Link className="y-btn line" to="/cliente/delivery">Pedir delivery</Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="y-landing-footer">
        <div className="y-landing-footer__main">
          <div className="y-landing-footer__brand">
            <span className="y-landing-footer__eyebrow">Chifa contemporáneo</span>
            <strong>Chifa Yemheng</strong>
            <p>El sabor del wok, en tu mesa.</p>
          </div>
          <div className="y-landing-footer__column">
            <h2>Visítanos</h2>
            <p><MapPin size={17} aria-hidden="true" /> Calle Libertad 133/140, Ica</p>
            <p><Clock size={17} aria-hidden="true" /> Todos los días, de 12:00 p. m. a 10:00 p. m.</p>
          </div>
          <div className="y-landing-footer__column">
            <h2>Contáctanos</h2>
            <a href="tel:+51956321786"><Phone size={17} aria-hidden="true" /> +51 956 321 786</a>
            <a href="https://wa.me/51956321786" target="_blank" rel="noreferrer">
              <MessageCircle size={17} aria-hidden="true" /> Escríbenos por WhatsApp
            </a>
          </div>
          <nav className="y-landing-footer__column" aria-label="Enlaces del sitio">
            <h2>Explora</h2>
            <Link to="/cliente/menu">Carta</Link>
            <Link to="/cliente/reservas">Reservar mesa</Link>
            <Link to="/cliente/delivery">Pedir delivery</Link>
          </nav>
        </div>
        <div className="y-landing-footer__bottom">
          <span>© {new Date().getFullYear()} Chifa Yemheng. Todos los derechos reservados.</span>
          <span>Hecho para disfrutar en cada visita.</span>
        </div>
      </footer>
    </div>
  );
}