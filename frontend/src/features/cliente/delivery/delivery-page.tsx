import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, ShoppingBag, WalletCards } from 'lucide-react';
import { useClienteAuth } from '../auth/cliente-auth-context';
import { DeliveryWizard } from './components/DeliveryWizard';
import { DeliveryTracking } from './components/DeliveryTracking';
import { api } from '@/shared/services/api-client';

export function ClienteDeliveryPage() {
  const { cliente } = useClienteAuth();
  const [deliveryId, setDeliveryId] = useState<number | null>(null);
  const [loadingDelivery, setLoadingDelivery] = useState(Boolean(cliente));
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!cliente) {
      setLoadingDelivery(false);
      return;
    }

    let cancelled = false;
    setLoadingDelivery(true);
    setDeliveryError(null);
    api.getDeliveryActivoCliente()
      .then(({ idPedidoDelivery }) => {
        if (!cancelled) setDeliveryId(idPedidoDelivery);
      })
      .catch((error: unknown) => {
        console.error('Error consultando delivery activo:', error);
        if (!cancelled) setDeliveryError('No pudimos consultar tu pedido activo. Intenta nuevamente antes de crear otro.');
      })
      .finally(() => {
        if (!cancelled) setLoadingDelivery(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cliente?.id, retryKey]);

  // Guest view: presentación informativa (sin datos de negocio hardcodeados).
  if (!cliente) {
    return (
      <div className="y-shell">
        <main className="y-cliente-page">
          <div className="y-head">
            <Link to="/cliente/inicio" className="y-icon-btn" aria-label="Volver"><ArrowLeft size={18} /></Link>
            <h2 className="font-d" style={{ margin: 0, fontSize: 22 }}>Delivery</h2>
          </div>
          <section className="y-flow-hero y-cliente-flow-hero" aria-labelledby="delivery-guest-title">
            <div className="y-flow-hero__content">
              <span className="y-flow-hero__eyebrow">Pedido a domicilio</span>
              <h1 id="delivery-guest-title" className="y-flow-hero__title">Prepara tu pedido desde aquí.</h1>
              <p className="y-flow-hero__description">
                Explora la carta y conoce cómo preparar un pedido para recibirlo en casa.
              </p>
            </div>
          </section>
          <section className="y-guest-content" aria-label="Cómo funciona el delivery">
            <div className="y-guest-section-heading">
              <span className="y-cliente-kicker">El sabor llega a casa</span>
              <h2>Un pedido sencillo y claro</h2>
              <p>Revisa cada paso y el costo de envío antes de confirmar.</p>
            </div>
            <div className="y-guest-steps">
              <article className="y-panel y-guest-step">
                <span className="y-guest-step__icon"><ShoppingBag size={23} /></span>
                <span className="y-guest-step__number">01</span>
                <h2>Elige tus platos</h2>
                <p>Revisa la carta y agrega al pedido lo que te gustaría disfrutar.</p>
              </article>
              <article className="y-panel y-guest-step">
                <span className="y-guest-step__icon"><MapPin size={23} /></span>
                <span className="y-guest-step__number">02</span>
                <h2>Indica dónde recibirlo</h2>
                <p>Ingresa tu dirección y distrito para comprobar la cobertura.</p>
              </article>
              <article className="y-panel y-guest-step">
                <span className="y-guest-step__icon"><WalletCards size={23} /></span>
                <span className="y-guest-step__number">03</span>
                <h2>Revisa antes de confirmar</h2>
                <p>Verás el costo de envío y el resumen antes de enviar el pedido.</p>
              </article>
            </div>
            <div className="y-guest-explore-links">
              <Link to="/cliente/menu">Explora los platos disponibles <span aria-hidden="true">→</span></Link>
              <Link to="/cliente/reservas">¿Vienes al local? Conoce las reservas <span aria-hidden="true">→</span></Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (loadingDelivery) {
    return (
      <div className="y-shell y-responsive-page">
        <div className="y-panel" style={{ padding: 22 }}>Consultando tu pedido activo…</div>
      </div>
    );
  }

  if (deliveryError) {
    return (
      <div className="y-shell y-responsive-page">
        <div className="y-head">
          <Link to="/cliente/inicio" className="y-icon-btn" aria-label="Volver"><ArrowLeft size={18} /></Link>
          <h2 className="font-d" style={{ margin: 0, fontSize: 22 }}>Delivery</h2>
        </div>
        <div className="y-panel" role="alert" style={{ padding: 22 }}>
          <p>{deliveryError}</p>
          <button className="y-btn red" onClick={() => setRetryKey((key) => key + 1)}>Volver a intentar</button>
        </div>
      </div>
    );
  }

  // Logged-in: seguimiento si ya hay un delivery creado, si no el wizard (único flujo).
  if (deliveryId !== null) {
    return (
      <div className="y-shell y-responsive-page">
        <div className="y-head">
          <Link to="/cliente/inicio" className="y-icon-btn" aria-label="Volver"><ArrowLeft size={18} /></Link>
          <h2 className="font-d" style={{ margin: 0, fontSize: 22 }}>Delivery</h2>
        </div>
        <DeliveryTracking deliveryId={deliveryId} />
        <div style={{ padding: 16, display: 'flex', justifyContent: 'center' }}>
          <Link to="/cliente/menu" className="y-btn y-btn-hero-secondary y-client-action-secondary">
            Ver carta
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="y-shell">
      <main className="y-cliente-page">
      <div className="y-head">
        <Link to="/cliente/inicio" className="y-icon-btn" aria-label="Volver"><ArrowLeft size={18} /></Link>
        <h2 className="font-d" style={{ margin: 0, fontSize: 22 }}>Delivery</h2>
      </div>
      <section className="y-flow-hero y-cliente-flow-hero" aria-labelledby="delivery-title">
        <div className="y-flow-hero__content">
          <span className="y-flow-hero__eyebrow">Pedido a domicilio</span>
          <h1 id="delivery-title" className="y-flow-hero__title">Completa tu pedido.</h1>
          <p className="y-flow-hero__description">Sigue los pasos y revisa los datos antes de confirmar.</p>
        </div>
      </section>
      <section className="y-panel y-delivery-form-panel">
        <DeliveryWizard onCreated={(idPedidoDelivery) => setDeliveryId(idPedidoDelivery)} />
      </section>
      <div style={{ padding: 16, display: 'flex', justifyContent: 'center' }}>
        <Link to="/cliente/menu" className="y-btn y-btn-hero-secondary y-client-action-secondary">
          Ver carta
        </Link>
      </div>
      </main>
    </div>
  );
}
