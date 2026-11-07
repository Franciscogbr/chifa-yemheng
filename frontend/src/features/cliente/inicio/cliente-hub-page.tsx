import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, QrCode, Truck, UtensilsCrossed } from 'lucide-react';
import { QrScannerModal } from '../../../components/QrScannerModal';
import { useCart } from '../../../contexts/CartContext';
import { guardarModoCliente, limpiarModoCliente, useModoCliente } from '../auth/cliente-mode';

const MESA_QR_VALIDADO_KEY = 'chifa.cliente.mesa.qr-validado';

function marcarQrValidado(): void {
  sessionStorage.setItem(MESA_QR_VALIDADO_KEY, '1');
}

function limpiarQrValidado(): void {
  sessionStorage.removeItem(MESA_QR_VALIDADO_KEY);
}

export function ClienteHubPage() {
  const { mesaId, setMesaId, clear } = useCart();
  const navigate = useNavigate();
  const [scannerOpen, setScannerOpen] = useState(false);
  const modo = useModoCliente();

  function elegirCasa() {
    setMesaId('');
    clear();
    limpiarQrValidado();
    guardarModoCliente('casa');
  }

  function volverASeleccion() {
    limpiarModoCliente();
    setMesaId('');
    limpiarQrValidado();
    clear();
  }

  /**
   * "Estoy en el local": SIEMPRE se exige escaneo QR. Nunca se entra directo,
   * aunque ya haya una mesa guardada de una sesión previa.
   */
  function elegirLocal() {
    setMesaId('');
    clear();
    setScannerOpen(true);
  }

  /**
   * Si ya hay modo 'local' pero no hay mesaId (restaurado de sessionStorage
   * sin escaneo en esta sesión), se abre el scanner automáticamente.
   */
  useEffect(() => {
    if (modo === 'local' && !mesaId && !scannerOpen) {
      setScannerOpen(true);
    }
  }, [modo, mesaId, scannerOpen]);

  return (
    <div className="y-shell">
      <main className="y-cliente-page">
        {modo && (
          <section className="y-flow-hero y-cliente-flow-hero" aria-labelledby="cliente-home-title">
            <div className="y-flow-hero__content">
              <span className="y-flow-hero__eyebrow">Chifa Yemheng</span>
              <h1 id="cliente-home-title" className="y-flow-hero__title">
                {modo === 'local'
                  ? (mesaId ? `Mesa ${mesaId} identificada` : 'Estoy en el local')
                  : 'No estoy en el local'}
              </h1>
              <p className="y-flow-hero__description">
                {modo === 'local'
                  ? mesaId
                    ? 'Consulta el menú, arma tu pedido y revisa la comanda de esta mesa.'
                    : 'Escanea el QR de tu mesa para continuar.'
                  : 'Pide delivery o gestiona una reserva desde casa.'}
              </p>
            </div>
          </section>
        )}

        {!modo && (
          <section aria-labelledby="cliente-secciones-title">
            <div className="y-cliente-section-heading">
              <div>
                <span className="y-cliente-kicker">Elige tu experiencia</span>
                <h2 id="cliente-secciones-title" className="font-d">
                  ¿Dónde estás hoy?
                </h2>
              </div>
            </div>
            <div className="y-tiles y-cliente-tiles">
              <button
                type="button"
                className="y-tile"
                onClick={elegirLocal}
                style={{ color: 'inherit', textAlign: 'left', cursor: 'pointer' }}
              >
                <div className="ic"><QrCode size={20} /></div>
                <b>Estoy en el local</b>
                <span>
                  Escanea el QR de tu mesa para ver el menú, hacer tu pedido y consultar tu comanda.
                </span>
              </button>
              <button
                type="button"
                className="y-tile"
                onClick={elegirCasa}
                style={{ color: 'inherit', textAlign: 'left', cursor: 'pointer' }}
              >
                <div className="ic"><MapPin size={20} /></div>
                <b>No estoy en el local</b>
                <span>
                  Pide delivery desde casa o consulta y realiza una reserva.
                </span>
              </button>
            </div>
          </section>
        )}

        {modo === 'local' && (
          <section aria-label="Opciones en el local">
            <div className="y-tiles y-cliente-tiles">
              {mesaId ? (
                <Link to="/cliente/menu" className="y-tile">
                  <div className="ic"><UtensilsCrossed size={20} /></div>
                  <b>Ver menú</b>
                  <span>Elige platos para agregar a la comanda.</span>
                </Link>
              ) : (
                <button
                  type="button"
                  className="y-tile"
                  onClick={elegirLocal}
                  style={{ color: 'inherit', textAlign: 'left', cursor: 'pointer' }}
                >
                  <div className="ic"><UtensilsCrossed size={20} /></div>
                  <b>Escanear QR de mesa</b>
                  <span>Valida la mesa para continuar con tu pedido.</span>
                </button>
              )}
              {mesaId && (
                <Link to="/cliente/mi-consumo" className="y-tile">
                  <div className="ic"><QrCode size={20} /></div>
                  <b>Mi comanda</b>
                  <span>Consulta los platos y el estado de tu consumo.</span>
                </Link>
              )}
            </div>
            <button type="button" className="y-btn line" onClick={volverASeleccion}>
              Cambiar opción
            </button>
          </section>
        )}

        {modo === 'casa' && (
          <section aria-labelledby="cliente-casa-title">
            <div className="y-cliente-section-heading">
              <div>
                <span className="y-cliente-kicker">No estoy en el local</span>
                <h2 id="cliente-casa-title" className="font-d">
                  ¿Qué te gustaría hacer?
                </h2>
              </div>
            </div>
            <p>Haz tu pedido para recibirlo en casa o reserva una mesa para tu próxima visita.</p>
            <div className="y-tiles y-cliente-tiles">
              <Link to="/cliente/delivery" className="y-tile">
                <div className="ic"><Truck size={20} /></div>
                <b>Pedir delivery</b>
                <span>Elige tus platos e indica dónde quieres recibirlos.</span>
              </Link>
              <Link to="/cliente/reservas" className="y-tile">
                <div className="ic"><CalendarDays size={20} /></div>
                <b>Hacer una reserva</b>
                <span>Solicita una mesa y consulta tus reservas.</span>
              </Link>
            </div>
            <button type="button" className="y-btn line" onClick={volverASeleccion}>
              Cambiar opción
            </button>
          </section>
        )}
      </main>

      {/* El scanner es el ÚNICO camino para entrar al modo local */}
      <QrScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={(mesaId) => {
          clear();
          setMesaId(mesaId);
          marcarQrValidado();
          guardarModoCliente('local');
          setScannerOpen(false);
          navigate('/cliente/menu');
        }}
      />
    </div>
  );
}
