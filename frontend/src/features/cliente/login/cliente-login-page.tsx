import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const FONDO_LOCAL = '/img/fachada-yemheng.png';
const SELLO = '/img/sello-yemheng.svg';
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1';

type EstadoQr = 'sin-mesa' | 'validando' | 'valida' | 'invalida' | 'sin-conexion';

function ocultarSiFalla(e: React.SyntheticEvent<HTMLImageElement>) {
  (e.target as HTMLImageElement).style.display = 'none';
}

/** Extrae el número de mesa desde el código QR (`01-AbCd1234` → `01`). */
function numeroMesa(codigo: string): string {
  const limpio = codigo.trim();
  if (!limpio) return '';
  return limpio.replace(/-[A-Za-z0-9_-]{8}$/, '').trim() || limpio;
}

/**
 * /cliente/login — Login Cliente.
 * Responsive mobile-first: base = tarjeta centrada, lg: = split hero.
 */
export function ClienteLoginPage() {
  const [params] = useSearchParams();
  const mesa = (params.get('mesa') ?? '').trim();
  const numMesa = numeroMesa(mesa);
  const [verClave, setVerClave] = useState(false);
  const [camAbierta, setCamAbierta] = useState(false);
  const [errorCam, setErrorCam] = useState<string | null>(null);
  const [estadoQr, setEstadoQr] = useState<EstadoQr>(mesa ? 'validando' : 'sin-mesa');
  const [ambienteQr, setAmbienteQr] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Valida el código QR contra el backend (`GET /mesas/by-qr`, público).
  // Sin conexión no bloquea (fallback a mostrar Mesa NN, útil en LAN/dev).
  useEffect(() => {
    if (!mesa) {
      setEstadoQr('sin-mesa');
      return;
    }
    let cancelado = false;
    setEstadoQr('validando');
    setAmbienteQr('');
    const ctrl = new AbortController();
    fetch(`${API_URL}/mesas/by-qr?codigo=${encodeURIComponent(mesa)}`, { signal: ctrl.signal })
      .then((res) => {
        if (cancelado) return;
        if (res.ok) {
          setEstadoQr('valida');
          res
            .json()
            .then((body) => {
              if (!cancelado && body && typeof body.ambiente === 'string') {
                setAmbienteQr(body.ambiente);
              }
            })
            .catch(() => undefined);
        } else if (res.status === 404 || res.status === 400) {
          setEstadoQr('invalida');
        } else {
          setEstadoQr('sin-conexion');
        }
      })
      .catch(() => {
        if (!cancelado) setEstadoQr('sin-conexion');
      });
    return () => {
      cancelado = true;
      ctrl.abort();
    };
  }, [mesa]);
  /** Móvil = táctil o UA móvil. PC nunca muestra el aviso de escaneo (CLI-LOGIN-P8). */
  const esMovil =
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(pointer: coarse)').matches ||
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent));

  function detenerCamara() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  function cerrarCamara() {
    detenerCamara();
    setCamAbierta(false);
    setErrorCam(null);
  }

  // Solo vista previa: abre la cámara para escanear, sin decodificar aún.
  useEffect(() => {
    if (!camAbierta) return;
    let cancelado = false;
    setErrorCam(null);

    async function abrir() {
      try {
        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
          throw new Error('INSEGURO');
        }
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false,
          });
        } catch (e) {
          if ((e as Error)?.name === 'OverconstrainedError') {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          } else {
            throw e;
          }
        }
        if (cancelado) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
      } catch (e) {
        if (cancelado) return;
        const nombre = (e as Error)?.name ?? '';
        const codigo = (e as Error)?.message ?? '';
        if (codigo === 'INSEGURO') {
          setErrorCam('No se pudo abrir la cámara aquí (se requiere HTTPS o localhost). Usa la cámara de tu celular apuntando al QR.');
        } else if (nombre === 'NotAllowedError') {
          setErrorCam('Permiso de cámara denegado. Actívalo en el navegador para escanear.');
        } else if (nombre === 'NotFoundError' || nombre === 'OverconstrainedError') {
          setErrorCam('No se encontró cámara disponible en este dispositivo.');
        } else {
          setErrorCam('No se pudo abrir la cámara en este momento.');
        }
      }
    }
    void abrir();

    function alEscape(ev: KeyboardEvent) {
      if (ev.key === 'Escape') cerrarCamara();
    }
    window.addEventListener('keydown', alEscape);
    return () => {
      cancelado = true;
      window.removeEventListener('keydown', alEscape);
      detenerCamara();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camAbierta]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#0e0705] font-[Plus_Jakarta_Sans] text-[#ffdf9a] antialiased selection:bg-[#b91c1c] selection:text-white">
      {/* Fondo local + scrims lacre */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-[#120806] via-[#1b0808] to-[#0b0504]">
        <img
          alt="Fachada Chifa Yemheng"
          src={FONDO_LOCAL}
          onError={ocultarSiFalla}
          className="h-full w-full scale-105 object-cover object-center brightness-[0.78] contrast-[1.08] saturate-[1.12]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0502]/85 via-[#120902]/60 to-[#0a0502]/95 lg:bg-gradient-to-r lg:from-[#0d0504]/95 lg:via-[#190606]/65 lg:to-[#090302]/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0604] via-transparent to-[#1a0707]/75" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(185,28,28,0.22)_0%,_transparent_70%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-between px-5 py-5 select-none lg:max-w-7xl lg:px-14 lg:py-8">
        {/* Header marca */}
        <header className="flex w-full items-center justify-between gap-3 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#1e0a08]/80 p-0.5 shadow-[0_0_20px_rgba(217,119,7,0.3)] ring-2 ring-[#d97707]/60 backdrop-blur-md">
              <img
                alt="Yemheng Chifa Tradicional"
                src={SELLO}
                onError={ocultarSiFalla}
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="flex items-center gap-2 text-sm font-bold tracking-widest text-[#ffdcc3] uppercase">
                Yemheng <span className="font-[Newsreader] text-xs font-normal tracking-normal text-[#d97707] italic">益恒</span>
              </span>
              <span className="text-[10px] font-semibold tracking-[0.2em] text-[#e4beb9]/70 uppercase">
                Chifa Tradicional
              </span>
            </div>
          </div>
          <span className="rounded-full border border-[#d97707]/50 bg-[#d97707]/15 px-3 py-1 text-[11px] font-bold tracking-wider text-[#ffb77d] uppercase">
            Acceso clientes
          </span>
        </header>

        {/* Centro: narrativa hero (solo desktop) + tarjeta */}
        <div className="my-auto grid w-full grid-cols-1 items-center gap-8 py-4 lg:grid-cols-12 lg:gap-12 lg:py-6">
          <div className="hidden flex-col justify-center space-y-6 text-left lg:col-span-6 lg:flex xl:col-span-7 lg:pr-6">
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#b91c1c]/40 bg-[#3d1210]/60 px-3.5 py-1 backdrop-blur-md">
              <span className="font-[Newsreader] text-base text-[#ffdcc3]">益 恒</span>
              <span className="h-1 w-1 rounded-full bg-[#d97707]" />
              <span className="text-xs font-semibold tracking-widest text-[#ffb77d] uppercase">Acceso clientes</span>
            </div>
            {esMovil || mesa ? (
              <>
                <div className="space-y-3">
                  <h1 className="font-[Epilogue] text-4xl font-bold tracking-tight text-[#fff2e0] xl:text-5xl">
                    Tu mesa, tu pedido &amp; <br />
                    <span className="font-[Newsreader] font-normal text-[#ffb77d] italic drop-shadow-[0_2px_12px_rgba(217,119,7,0.35)]">
                      desde tu celular
                    </span>
                  </h1>
                  <p className="max-w-lg text-sm leading-relaxed text-[#e4beb9]/90 sm:text-base">
                    Escaneaste el QR de tu mesa. Ingresa con tu cuenta de Gmail para pedir y ver tu consumo
                    sin llamar al mozo.
                  </p>
                  <p className="max-w-lg text-xs text-[#ffb77d]/80">
                    ¿En el local? Escanea el QR de tu mesa con tu cámara.
                  </p>
                </div>
                <div className="grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-lg border border-[#5b403d]/40 bg-[#25100d]/70 p-3 shadow-md backdrop-blur-md">
                    <span className="material-symbols-outlined rounded bg-[#b91c1c]/30 p-1.5 text-2xl text-[#ffb77d]">
                      qr_code_2
                    </span>
                    <div>
                      <div className="text-xs font-semibold tracking-wide text-[#ffdcc3] uppercase">QR de tu mesa</div>
                      <div className="text-center text-[11px] text-[#e4beb9]/70 sm:text-left">
                        {mesa ? `Mesa ${numMesa}` : 'Abre esta página desde el QR'}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <h1 className="font-[Epilogue] text-4xl font-bold tracking-tight text-[#fff2e0] xl:text-5xl">
                    Delivery, reservas y <br />
                    <span className="font-[Newsreader] font-normal text-[#ffb77d] italic drop-shadow-[0_2px_12px_rgba(217,119,7,0.35)]">
                      tus pedidos
                    </span>
                  </h1>
                  <p className="max-w-lg text-sm leading-relaxed text-[#e4beb9]/90 sm:text-base">
                    Pide delivery a domicilio,y  reserva tu mesa .
                  </p>
                </div>
                <div className="grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-lg border border-[#5b403d]/40 bg-[#25100d]/70 p-3 shadow-md backdrop-blur-md">
                    <span className="material-symbols-outlined rounded bg-[#b91c1c]/30 p-1.5 text-2xl text-[#ffb77d]">
                      delivery_dining
                    </span>
                    <div>
                      <div className="text-xs font-semibold tracking-wide text-[#ffdcc3] uppercase">Delivery a domicilio</div>
                      <div className="text-[11px] text-[#e4beb9]/70">Pide y sigue tu pedido en ruta</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-[#5b403d]/40 bg-[#25100d]/70 p-3 shadow-md backdrop-blur-md">
                    <span className="material-symbols-outlined rounded bg-[#b91c1c]/30 p-1.5 text-2xl text-[#ffb77d]">
                      table_restaurant
                    </span>
                    <div>
                      <div className="text-xs font-semibold tracking-wide text-[#ffdcc3] uppercase">Reserva tu mesa</div>
                      <div className="text-[11px] text-[#e4beb9]/70">Presencial, telefónica u online</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tarjeta vino sólido */}
          <div className="flex w-full justify-center lg:col-span-6 lg:justify-end xl:col-span-5">
            <div className="relative w-full max-w-md space-y-5 overflow-hidden rounded-2xl bg-[#7F1518] p-6 shadow-[0_12px_45px_rgba(0,0,0,0.65)] sm:p-8">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-[#ffdcc3] uppercase">
                    <span className="material-symbols-outlined text-sm text-[#F2C94C]">account_circle</span>
                    Área de clientes
                  </span>
                </div>
                <h2 className="font-[Epilogue] text-2xl font-bold tracking-tight text-white">Iniciar Sesión</h2>
                <p className="text-xs text-[#ffdcc3]/85">
                  Ingresa con tu cuenta para pedir desde tu mesa
                </p>
              </div>

              {mesa ? (
                estadoQr === 'validando' ? (
                  <p className="flex items-center justify-center gap-2 rounded-lg bg-black/25 px-3 py-2 text-center text-xs font-semibold text-white/80">
                    <span className="material-symbols-outlined animate-spin text-base text-[#F2C94C]">progress_activity</span>
                    Verificando tu mesa…
                  </p>
                ) : estadoQr === 'invalida' ? (
                  <p className="flex items-center justify-center gap-2 rounded-lg bg-black/25 px-3 py-2 text-center text-xs font-bold text-[#ffb4ab]">
                    <span className="material-symbols-outlined text-base text-[#ffb4ab]">error</span>
                    QR inválido. Escanea el QR pegado en tu mesa o pide ayuda al mozo.
                  </p>
                ) : (
                  <p className="flex items-center justify-center gap-2 rounded-lg bg-black/25 px-3 py-2 text-center text-xs font-semibold text-white">
                    <span className="material-symbols-outlined text-base text-[#F2C94C]">table_restaurant</span>
                    Mesa <span className="font-mono text-sm">{numMesa}</span>
                    {ambienteQr ? <span className="font-normal text-white/70">· {ambienteQr}</span> : null}
                  </p>
                )
              ) : esMovil ? (
                <div className="space-y-2 rounded-lg bg-black/25 px-3 py-2">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <span className="material-symbols-outlined text-base text-[#F2C94C]">
                      qr_code_scanner
                    </span>
                    ¿Estás en el local?
                  </p>
                  <p className="text-xs text-[#ffdcc3]/85">
                    Apunta tu cámara al QR de tu mesa para pedir desde aquí.
                  </p>
                  <p className="pt-1 text-[11px] font-bold tracking-wider text-[#F2C94C] uppercase">
                    Escanea el código QR:
                  </p>
                  <button
                    type="button"
                    aria-label="Abrir cámara para escanear QR"
                    onClick={() => setCamAbierta(true)}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-dashed border-[#F2C94C]/50 bg-white/10 px-4 py-3 text-xs font-bold text-white transition active:scale-[0.98] outline-none hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    <span className="material-symbols-outlined text-2xl text-[#F2C94C]">
                      qr_code_scanner
                    </span>
                    Toca para abrir la cámara
                  </button>
                </div>
              ) : (
                <p className="rounded-lg bg-black/25 px-3 py-2 text-xs text-[#ffdcc3]/85">
                  Entrada web: aquí ingresarás para delivery, reservas y tus pedidos.
                </p>
              )}

              <form onSubmit={(e) => e.preventDefault()} className="relative space-y-4">
                <div className="space-y-3">
                  <button
                    type="button"
                    disabled
                    className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-[#7F1518] shadow-md transition"
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.1 8.9 5 12 5z" fill="#EA4335" />
                      <path d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" fill="#4285F4" />
                      <path d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.6 6.4C.6 8.3 0 10.1 0 12s.6 3.7 1.6 5.6l3.7-2.9z" fill="#FBBC05" />
                      <path d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.3L1.6 16c1.9 3.7 5.8 7 10.4 7z" fill="#34A853" />
                    </svg>
                    <span>Continuar con Google / Gmail</span>
                  </button>
                  <div className="flex items-center gap-2.5">
                    <span className="h-[1px] flex-1 bg-white/25" />
                    <span className="text-[11px] tracking-wider text-white/70 uppercase">o continúa con tu correo</span>
                    <span className="h-[1px] flex-1 bg-white/25" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="cli-user" className="flex items-center gap-1 text-xs font-semibold text-white">
                    Correo electrónico <span className="text-[#F2C94C]">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined pointer-events-none absolute left-3.5 text-lg text-[#7F1518]/50">
                      person
                    </span>
                    <input
                      id="cli-user"
                      type="email"
                      value=""
                      readOnly
                      disabled
                      placeholder="tu.nombre@ejemplo.com"
                      className="w-full cursor-not-allowed rounded-xl bg-white py-2.5 pr-4 pl-10 text-sm text-[#333333] shadow-inner transition outline-none placeholder:text-[#333333]/40"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="cli-pass" className="flex items-center gap-1 text-xs font-semibold text-white">
                    Contraseña <span className="text-[#F2C94C]">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined pointer-events-none absolute left-3.5 text-lg text-[#7F1518]/50">
                      key
                    </span>
                    <input
                      id="cli-pass"
                      type={verClave ? 'text' : 'password'}
                      value=""
                      readOnly
                      disabled
                      placeholder="••••••••••••"
                      className="w-full cursor-not-allowed rounded-xl bg-white py-2.5 pr-11 pl-10 text-sm text-[#333333] shadow-inner transition outline-none placeholder:text-[#333333]/40"
                    />
                    <button
                      type="button"
                      aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      onClick={() => setVerClave((v) => !v)}
                      className="absolute right-3 rounded-lg p-1.5 text-[#7F1518]/60 transition-colors outline-none hover:bg-[#7F1518]/10 focus-visible:ring-2 focus-visible:ring-white/50"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {verClave ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex cursor-not-allowed items-center gap-2">
                    <input
                      type="checkbox"
                      checked={false}
                      disabled
                      className="h-4 w-4 cursor-not-allowed rounded border-white/40 bg-white accent-[#7F1518]"
                    />
                    <span className="text-xs font-medium text-white/80">Recordarme</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled
                  className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#F2C94C] px-4 py-3.5 text-xs font-bold tracking-wider text-[#7F1518] uppercase shadow-lg transition"
                >
                  <span>Iniciar sesión</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex w-full flex-col items-center justify-between gap-2 border-t border-[#5b403d]/30 pt-4 pb-2 text-xs text-[#e4beb9]/60 sm:flex-row">
          <p>© 2025 Chifa Yemheng. Todos los derechos reservados.</p>
        </footer>
      </div>

      {/* Modal cámara solo-visual: abre para escanear, sin decodificar aún */}
      {camAbierta && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Cámara para escanear QR"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={cerrarCamara}
        >
          <div
            className="w-full max-w-sm space-y-3 rounded-2xl bg-[#1e0a08] p-4 shadow-2xl ring-1 ring-[#d97707]/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-xs font-bold tracking-wider text-white uppercase">
                <span className="material-symbols-outlined text-base text-[#F2C94C]">qr_code_scanner</span>
                Apunta al QR de tu mesa
              </p>
              <button
                type="button"
                autoFocus
                aria-label="Cerrar cámara"
                onClick={cerrarCamara}
                className="rounded-lg p-1.5 text-white/80 outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {errorCam ? (
              <div className="space-y-3">
                <p aria-live="polite" className="rounded-xl bg-black/30 px-3 py-3 text-xs leading-relaxed text-[#ffdcc3]">
                  {errorCam}
                </p>
                <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#F2C94C] px-4 py-3 text-xs font-bold tracking-wider text-[#7F1518] uppercase">
                  <span className="material-symbols-outlined text-base">photo_camera</span>
                  O toma foto del QR
                  <input type="file" accept="image/*" capture="environment" className="hidden" />
                </label>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="aspect-[3/4] w-full rounded-xl bg-black object-cover"
              />
            )}

            {!errorCam && (
              <p className="text-center text-[11px] text-[#e4beb9]/70">
                Vista previa — la lectura automática llega en próxima fase.
              </p>
            )}

            <button
              type="button"
              onClick={cerrarCamara}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F2C94C] px-4 py-3 text-xs font-bold tracking-wider text-[#7F1518] uppercase"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
