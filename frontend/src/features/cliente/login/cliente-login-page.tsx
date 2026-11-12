import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  clienteGoogleLogin,
  clientePasswordLogin,
  clienteRegistrarCorreo,
  clienteSolicitarRestablecimiento,
} from './cliente-auth-service';
import { codigoQrCanonico } from '../../../lib/utils';
import { useClienteAuth } from '../auth/cliente-auth-context';

const FONDO_LOCAL = '/img/fachada-yemheng.webp';
const SELLO = '/img/sello-yemheng.svg';
type GoogleCredentialResponse = { credential?: string };
type GoogleCredentialCallback = (resp: GoogleCredentialResponse) => void;

// GIS mantiene su inicialización global aunque React StrictMode repita efectos.
let googleClienteClientIdInicializado: string | null = null;
let googleClienteCallbackActual: GoogleCredentialCallback | null = null;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (r: { credential?: string }) => void }) => void;
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}
import { API_URL } from '../../../lib/api-url';

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
  const navigate = useNavigate();
  const { establecerSesion } = useClienteAuth();
  const [verClave, setVerClave] = useState(false);
  const [camAbierta, setCamAbierta] = useState(false);
  const [errorCam, setErrorCam] = useState<string | null>(null);
  const [estadoQr, setEstadoQr] = useState<EstadoQr>(mesa ? 'validando' : 'sin-mesa');
  const [ambienteQr, setAmbienteQr] = useState<string>('');
  const [errorGoogle, setErrorGoogle] = useState<string | null>(null);
  const [cargandoGoogle, setCargandoGoogle] = useState(false);
  const [modoCorreo, setModoCorreo] = useState<'login' | 'registro'>('login');
  const [nombreCorreo, setNombreCorreo] = useState('');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [errorCorreo, setErrorCorreo] = useState<string | null>(null);
  const [mensajeCorreo, setMensajeCorreo] = useState<string | null>(null);
  const [cargandoCorreo, setCargandoCorreo] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (params.get('email_confirmed') === '1') {
      setMensajeCorreo('Correo verificado. Ya puedes iniciar sesión.');
    }
    if (window.location.hash.includes('access_token=')) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }
  }, [params]);

  function redirigirCliente() {
    const mesaParam = params.get('mesa');
    const destino = mesaParam
      ? `/cliente/inicio?mesa=${encodeURIComponent(mesaParam)}`
      : '/cliente/inicio';
    navigate(destino);
  }

  async function enviarFormularioCorreo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorCorreo(null);
    setMensajeCorreo(null);
    setCargandoCorreo(true);
    const email = correo.trim().toLowerCase();
    try {
      if (modoCorreo === 'registro') {
        const nombre = nombreCorreo.trim();
        if (nombre.length < 2) throw new Error('Ingresa tu nombre para crear la cuenta.');
        if (clave.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
        await clienteRegistrarCorreo(email, clave, nombre);
        setMensajeCorreo('Te enviamos un correo para verificar tu cuenta. Revisa también la carpeta de spam.');
        return;
      }

      const session = await clientePasswordLogin(email, clave);
      establecerSesion(session);
      redirigirCliente();
    } catch (error) {
      setErrorCorreo(error instanceof Error ? error.message : 'No se pudo completar la solicitud. Inténtalo nuevamente.');
    } finally {
      setCargandoCorreo(false);
    }
  }

  async function solicitarCambioClave() {
    setErrorCorreo(null);
    setMensajeCorreo(null);
    if (!correo.trim()) {
      setErrorCorreo('Escribe tu correo para enviarte el enlace de recuperación.');
      return;
    }
    setCargandoCorreo(true);
    try {
      await clienteSolicitarRestablecimiento(correo.trim().toLowerCase());
      setMensajeCorreo('Si el correo está registrado, recibirás un enlace para cambiar tu contraseña.');
    } catch (error) {
      setErrorCorreo(error instanceof Error ? error.message : 'No se pudo solicitar el cambio de contraseña.');
    } finally {
      setCargandoCorreo(false);
    }
  }

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
    fetch(`${API_URL}/mesas/by-qr?codigo=${encodeURIComponent(codigoQrCanonico(mesa))}`, { signal: ctrl.signal })
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
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) return;
    let cancelado = false;
    googleClienteCallbackActual = async (resp) => {
      if (!resp.credential) {
        setErrorGoogle('No se pudo obtener la credencial de Google.');
        return;
      }
      setCargandoGoogle(true);
      setErrorGoogle(null);
      try {
        const sesion = await clienteGoogleLogin(resp.credential);
        establecerSesion(sesion);
        redirigirCliente();
      } catch (e) {
        setErrorGoogle((e as Error)?.message ?? 'No fue posible validar con Google. Reintente.');
      } finally {
        setCargandoGoogle(false);
      }
    };

    function init() {
      if (cancelado || !window.google?.accounts?.id || !googleBtnRef.current) return;
      if (googleClienteClientIdInicializado !== clientId) {
        window.google.accounts.id.initialize({
          client_id: clientId!,
          callback: async (resp: GoogleCredentialResponse) => {
            if (!googleClienteCallbackActual) return;
            await googleClienteCallbackActual(resp);
          },
        });
        googleClienteClientIdInicializado = clientId!;
      }
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: 360,
      });
    }

    if (window.google?.accounts?.id) {
      init();
    } else {
      const existente = document.querySelector<HTMLScriptElement>('script[data-google-gsi]');
      if (existente) {
        existente.addEventListener('load', init, { once: true });
      } else {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.dataset.googleGsi = 'true';
        script.onload = init;
        document.head.appendChild(script);
      }
    }
    return () => {
      cancelado = true;
      googleClienteCallbackActual = null;
    };
  }, []);

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

          {/* Tarjeta estilo admin (glassmorphism) */}
          <div className="flex w-full justify-center lg:col-span-6 lg:justify-end xl:col-span-5">
            <div className="relative w-full max-w-md space-y-5 overflow-hidden rounded-2xl border border-amber-500/30 bg-[#180907]/85 p-6 shadow-[0_12px_45px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-8">
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#b91c1c] via-[#d97707] to-[#b91c1c]" />
              <div className="space-y-1">
                <h2 className="font-[Epilogue] text-2xl font-bold tracking-tight text-[#fff4e8]">Iniciar Sesión</h2>
                <p className="text-xs text-[#e4beb9]/75">
                  Acceso seguro al sistema de servicio y cocina
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

              <form onSubmit={(event) => void enviarFormularioCorreo(event)} className="relative space-y-4">
                <div className="space-y-3">
                  {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                    <div className="space-y-2">
                      <div ref={googleBtnRef} className="flex w-full justify-center" />
                      {cargandoGoogle && (
                        <p className="text-center text-xs text-white/80">Validando con Google…</p>
                      )}
                      {errorGoogle && (
                        <p className="rounded-lg border border-[#ff8f8f]/30 bg-[#551010]/85 px-3 py-2 text-center text-xs font-semibold text-[#ffb4ab]">
                          {errorGoogle}
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-[#7F1518] shadow-md transition"
                    >
                      <span>Configura VITE_GOOGLE_CLIENT_ID</span>
                    </button>
                  )}
                  <div className="flex items-center gap-2.5">
                    <span className="h-[1px] flex-1 bg-white/25" />
                    <span className="text-[11px] tracking-wider text-white/70 uppercase">o continúa con tu correo</span>
                    <span className="h-[1px] flex-1 bg-white/25" />
                  </div>
                </div>

                {modoCorreo === 'registro' && (
                  <div className="space-y-1.5">
                    <label htmlFor="cli-name" className="block text-xs font-medium text-[#ffdcc3]">
                      Nombre completo <span className="text-[#ffb4ab]">*</span>
                    </label>
                    <input
                      id="cli-name"
                      type="text"
                      autoComplete="name"
                      value={nombreCorreo}
                      onChange={(event) => setNombreCorreo(event.target.value)}
                      placeholder="Tu nombre"
                      required
                      minLength={2}
                      maxLength={100}
                      className="h-11 w-full rounded-lg border border-[#5b403d] bg-[#250d09]/90 px-3.5 text-sm text-[#fff4e8] shadow-inner transition-all outline-none placeholder:text-[#ab8985]/60 focus:border-[#d97707] focus:ring-1 focus:ring-[#d97707]"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="cli-user" className="block text-xs font-medium text-[#ffdcc3]">
                    Correo electrónico <span className="text-[#ffb4ab]">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined pointer-events-none absolute left-3.5 text-lg text-[#ffb77d]/70">
                      person
                    </span>
                    <input
                      id="cli-user"
                      type="email"
                      autoComplete="email"
                      value={correo}
                      onChange={(event) => setCorreo(event.target.value)}
                      placeholder="tu.nombre@ejemplo.com"
                      required
                      className="h-11 w-full rounded-lg border border-[#5b403d] bg-[#250d09]/90 pr-3.5 pl-10 text-sm text-[#fff4e8] shadow-inner transition-all outline-none placeholder:text-[#ab8985]/60 focus:border-[#d97707] focus:ring-1 focus:ring-[#d97707]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="cli-pass" className="block text-xs font-medium text-[#ffdcc3]">
                    Contraseña <span className="text-[#ffb4ab]">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined pointer-events-none absolute left-3.5 text-lg text-[#ffb77d]/70">
                      key
                    </span>
                    <input
                      id="cli-pass"
                      type={verClave ? 'text' : 'password'}
                      autoComplete={modoCorreo === 'registro' ? 'new-password' : 'current-password'}
                      value={clave}
                      onChange={(event) => setClave(event.target.value)}
                      placeholder="••••••••••••"
                      minLength={modoCorreo === 'registro' ? 8 : undefined}
                      required
                      className="h-11 w-full rounded-lg border border-[#5b403d] bg-[#250d09]/90 pr-11 pl-10 text-sm text-[#fff4e8] shadow-inner transition-all outline-none placeholder:text-[#ab8985]/60 focus:border-[#d97707] focus:ring-1 focus:ring-[#d97707]"
                    />
                    <button
                      type="button"
                      aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      onClick={() => setVerClave((v) => !v)}
                      className="absolute right-3 flex items-center justify-center rounded p-1 text-[#ffb77d]/70 transition-colors hover:text-[#ffdcc3]"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {verClave ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {modoCorreo === 'login' ? (
                    <>
                      <label className="flex cursor-pointer items-center gap-2 select-none">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 cursor-pointer rounded border-[#5b403d] bg-[#250d09] accent-[#b91c1c]"
                        />
                        <span className="text-xs text-[#ffdcc3]/90">Recordarme</span>
                      </label>
                      <button
                        type="button"
                        disabled={cargandoCorreo}
                        onClick={() => void solicitarCambioClave()}
                        className="text-xs text-[#ffb77d] underline decoration-[#ffb77d]/50 underline-offset-2 hover:text-[#ffdcc3] disabled:opacity-60"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-[#e4beb9]/70">Usa al menos 8 caracteres.</span>
                  )}
                </div>

                {errorCorreo && (
                  <p role="alert" className="rounded-lg border border-[#ff8f8f]/30 bg-[#551010]/85 px-3 py-2 text-center text-xs font-semibold text-[#ffb4ab]">
                    {errorCorreo}
                  </p>
                )}
                {mensajeCorreo && (
                  <p role="status" aria-live="polite" className="rounded-lg border border-emerald-300/25 bg-emerald-950/50 px-3 py-2 text-center text-xs font-semibold text-emerald-100">
                    {mensajeCorreo}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={cargandoCorreo}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#ff8f8f]/30 bg-[#b91c1c] text-xs font-semibold tracking-wider text-white shadow-[0_4px_16px_rgba(185,28,28,0.5)] transition-all duration-200 hover:bg-[#a01818] active:scale-[0.99]"
                >
                  <span>{cargandoCorreo ? 'PROCESANDO…' : modoCorreo === 'registro' ? 'CREAR CUENTA' : 'INICIAR SESIÓN'}</span>
                  <span className="text-sm font-bold">→</span>
                </button>
                <p className="text-center text-xs text-[#e4beb9]/75">
                  {modoCorreo === 'registro' ? '¿Ya tienes una cuenta?' : '¿Aún no tienes cuenta?'}{' '}
                  <button
                    type="button"
                    disabled={cargandoCorreo}
                    onClick={() => {
                      setModoCorreo((mode) => mode === 'login' ? 'registro' : 'login');
                      setErrorCorreo(null);
                      setMensajeCorreo(null);
                    }}
                    className="font-semibold text-[#ffb77d] underline decoration-[#ffb77d]/50 underline-offset-2 hover:text-[#ffdcc3] disabled:opacity-60"
                  >
                    {modoCorreo === 'registro' ? 'Inicia sesión' : 'Regístrate'}
                  </button>
                </p>
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
