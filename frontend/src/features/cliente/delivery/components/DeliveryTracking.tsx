import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bike, Check, PackageCheck } from 'lucide-react';
import { MapLeaflet } from '@/shared/ui/MapLeaflet';
import { useDeliveryUbicacion } from '@/shared/hooks/useDeliveryUbicacion';
import { api } from '@/shared/services/api-client';

const ESTADO_LABEL: Record<DeliverySituacion, string> = {
  P: 'Pendiente',
  R: 'En ruta',
  E: 'Entregado',
  C: 'Cancelado',
};

const PASOS: { id: 'P' | 'R' | 'E'; label: string; icon: typeof Bike }[] = [
  { id: 'P', label: 'Pendiente', icon: PackageCheck },
  { id: 'R', label: 'En ruta', icon: Bike },
  { id: 'E', label: 'Entregado', icon: Check },
];

type DeliverySituacion = 'P' | 'R' | 'E' | 'C';

interface DeliveryComprobanteCliente {
  id_venta: number;
  serie: string;
  numero: string;
  total: number;
  total_pagado: number;
  f_venta: string;
  tipo_documento: string;
  metodo_pago: string | null;
  monto_pagado: number;
  cliente_documento: string | null;
  cliente_nombre: string | null;
  items: Array<{
    idProducto: number;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
    subTotal: number;
  }>;
}

function hora(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

export function DeliveryTracking({ deliveryId }: { deliveryId: number }) {
  const { ubicacion, loading } = useDeliveryUbicacion(deliveryId);
  const [comprobante, setComprobante] = useState<DeliveryComprobanteCliente | null>(null);

  const cargarComprobante = async () => {
    if (!deliveryId) return;
    try {
      const data = await api.getDeliveryComprobante(deliveryId);
      setComprobante(data as unknown as DeliveryComprobanteCliente);
    } catch (e) {
      console.error('Error cargando comprobante:', e);
    }
  };

  useEffect(() => {
    if (ubicacion?.situacion === 'E' && (ubicacion.montoPagado ?? 0) > 0 && !comprobante) {
      void cargarComprobante();
    }
  }, [ubicacion, deliveryId, comprobante]);

  if (loading && !ubicacion) {
    return (
      <div className="y-shell y-responsive-page">
        <div className="y-panel" style={{ padding: 22 }}>Cargando seguimiento…</div>
      </div>
    );
  }

  if (!ubicacion) {
    return (
      <div className="y-shell y-responsive-page">
        <div className="y-head">
          <Link to="/cliente/inicio" className="y-icon-btn" aria-label="Volver"><ArrowLeft size={18} /></Link>
          <h2 className="font-d" style={{ margin: 0, fontSize: 22 }}>Seguimiento delivery</h2>
        </div>
        <div className="y-panel" style={{ padding: 22 }}>No encontramos información de este delivery.</div>
      </div>
    );
  }

  const idx = PASOS.findIndex((p) => p.id === (ubicacion.situacion as 'P' | 'R' | 'E'));
  const subtotal = ubicacion.totalPedido ?? 0;
  const envio = ubicacion.costo_envio ?? 0;
  const total = subtotal + envio;
  const montoPorCobrar = ubicacion.montoPorCobrar ?? total;
  const yaPagado = ubicacion.montoPagado ?? 0;

  const pins = [
    ubicacion.lat_cliente !== null && ubicacion.lng_cliente !== null
      ? { lat: ubicacion.lat_cliente, lng: ubicacion.lng_cliente, label: 'Dirección de entrega', color: 'blue' as const }
      : null,
    ubicacion.lat_repartidor !== null && ubicacion.lng_repartidor !== null
      ? { lat: ubicacion.lat_repartidor, lng: ubicacion.lng_repartidor, label: 'Repartidor', color: 'red' as const }
      : null,
  ].filter((p): p is NonNullable<typeof p> => p !== null);
  const center: [number, number] | undefined = pins.length === 0
    ? undefined
    : pins.length === 1
      ? [pins[0].lat, pins[0].lng]
      : [(pins[0].lat + pins[1].lat) / 2, (pins[0].lng + pins[1].lng) / 2];

  const estadoEntregado = ubicacion.situacion === 'E' && (ubicacion.montoPagado ?? 0) > 0;

  /* ---------- Estado: Entregado + pagado (pantalla de agradecimiento) ---------- */
  if (estadoEntregado) {
    return (
      <div className="y-shell y-responsive-page">
        <div className="y-head">
          <Link to="/cliente/inicio" className="y-icon-btn" aria-label="Volver"><ArrowLeft size={18} /></Link>
          <h2 className="font-d" style={{ margin: 0, fontSize: 22 }}>¡Gracias por tu compra!</h2>
        </div>
        <div className="y-panel" style={{ padding: 22 }}>
          <div className="max-w-md mx-auto text-center">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check size={32} className="text-green-600" />
              </div>
              <h1 className="font-bold text-gray-900">¡Gracias por tu compra!</h1>
              <p className="text-gray-600">Tu pedido ha sido entregado y el pago está confirmado.</p>

              <div className="mt-6 p-4 rounded-lg border border-green-200 bg-green-50">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Pedido #</span>
                  <span className="text-gray-700 font-bold">{ubicacion.id_pedido}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Dirección</span>
                  <span className="text-gray-700">{ubicacion.direccion_entrega}{ubicacion.distrito ? `, ${ubicacion.distrito}` : ''}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Repartidor</span>
                  <span className="text-gray-700">{ubicacion.repartidor || '—'}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Total pagado</span>
                  <span className="text-gray-700 font-bold">S/ {yaPagado.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Método de pago</span>
                  <span className="text-gray-700">{ubicacion.metodoPago || '—'}</span>
                </div>
              </div>

              {comprobante && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-gray-700 mb-3 text-left">Tu boleta</h3>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Serie</span>
                    <span className="text-gray-700 font-bold">{comprobante.serie}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Número</span>
                    <span className="text-gray-700 font-bold">{comprobante.numero}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Fecha</span>
                    <span className="text-gray-700">{new Date(comprobante.f_venta).toLocaleDateString('es-PE')}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Total</span>
                    <span className="text-gray-700 font-bold">S/ {comprobante.total_pagado.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Método de pago</span>
                    <span className="text-gray-700">{comprobante.metodo_pago || '—'}</span>
                  </div>
                  {comprobante.items && comprobante.items.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">Platos del pedido</h4>
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="text-left border-b border-gray-200">
                            <th className="pb-1 text-gray-500 font-medium">Producto</th>
                            <th className="pb-1 text-gray-500 font-medium text-right">Cant.</th>
                            <th className="pb-1 text-gray-500 font-medium text-right">Precio</th>
                            <th className="pb-1 text-gray-500 font-medium text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {comprobante.items.map((item) => (
                            <tr key={item.idProducto} className="hover:bg-gray-50">
                              <td className="py-2 text-gray-700">{item.nombre}</td>
                              <td className="py-2 text-gray-700 text-right">{item.cantidad}</td>
                              <td className="py-2 text-gray-700 text-right">S/ {item.precioUnitario.toFixed(2)}</td>
                              <td className="py-2 text-gray-700 text-right font-medium">S/ {item.subTotal.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const printWindow = window.open('', '_blank', 'width=600,height=800');
                      if (!printWindow) return;
                      printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <meta charset="utf-8" />
                            <title>Boleta ${comprobante.serie}-${comprobante.numero}</title>
                            <style>
                              body { font-family: sans-serif; padding: 20px; color: #111; }
                              .header { text-align: center; border-bottom: 2px solid #7F1518; padding-bottom: 10px; margin-bottom: 20px; }
                              .header h1 { margin: 0; font-size: 20px; color: #7F1518; }
                              .info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; }
                              .info div { margin: 4px 0; }
                              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                              th { text-align: left; padding: 8px; border-bottom: 1px solid #ccc; font-size: 13px; color: #666; }
                              td { padding: 8px; border-bottom: 1px solid #eee; font-size: 14px; }
                              .total { font-weight: bold; font-size: 16px; color: #7F1518; }
                              .footer { margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; font-size: 12px; color: #666; text-align: center; }
                              @media print { button { display: none; } }
                            </style>
                          </head>
                          <body>
                            <div class="header">
                              <h1>CHIFA - BOLETA ELECTRÓNICA</h1>
                            </div>
                            <div class="info">
                              <div><strong>Serie:</strong> ${comprobante.serie}</div>
                              <div><strong>Número:</strong> ${comprobante.numero}</div>
                              <div><strong>Fecha:</strong> ${new Date(comprobante.f_venta).toLocaleDateString('es-PE')}</div>
                              <div><strong>Cliente:</strong> ${comprobante.cliente_nombre || 'Cliente'}</div>
                            </div>
                            <div class="info">
                              <div><strong>Método de pago:</strong> ${comprobante.metodo_pago || '—'}</div>
                              <div><strong>Total pagado:</strong> S/ ${comprobante.total_pagado.toFixed(2)}</div>
                            </div>
                            ${comprobante.items && comprobante.items.length > 0 ? `
                            <table>
                              <thead>
                                <tr>
                                  <th style="text-align:left;padding:8px;border-bottom:1px solid #ccc;font-size:13px;color:#666;">Producto</th>
                                  <th style="text-align:right;padding:8px;border-bottom:1px solid #ccc;font-size:13px;color:#666;">Cant.</th>
                                  <th style="text-align:right;padding:8px;border-bottom:1px solid #ccc;font-size:13px;color:#666;">Precio</th>
                                  <th style="text-align:right;padding:8px;border-bottom:1px solid #ccc;font-size:13px;color:#666;">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${comprobante.items.map(item => `
                                  <tr>
                                    <td style="padding:8px;border-bottom:1px solid #eee;font-size:14px;">${item.nombre}</td>
                                    <td style="padding:8px;border-bottom:1px solid #eee;font-size:14px;text-align:right;">${item.cantidad}</td>
                                    <td style="padding:8px;border-bottom:1px solid #eee;font-size:14px;text-align:right;">S/ ${item.precioUnitario.toFixed(2)}</td>
                                    <td style="padding:8px;border-bottom:1px solid #eee;font-size:14px;text-align:right;font-weight:bold;">S/ ${item.subTotal.toFixed(2)}</td>
                                  </tr>
                                `).join('')}
                              </tbody>
                            </table>
                            ` : ''}
                            <div class="footer">
                              Gracias por su compra. Boleta electrónica generada al entregar y cobrar.
                            </div>
                            <button onclick="window.print(); return false;" style="margin-top:20px;padding:10px 20px;background:#7F1518;color:#fff;border:none;border-radius:6px;cursor:pointer;">Imprimir boleta</button>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.focus();
                      printWindow.print();
                    }}
                    className="mt-4 flex items-center gap-2 text-sm text-blue-700 hover:underline"
                  >
                    Imprimir boleta
                  </button>
                </div>
              )}

              <div className="mt-8 flex justify-center">
                <Link to="/cliente/inicio" className="y-btn red inline-flex items-center gap-2">
                  Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Estado: Cancelado ---------- */
  if (ubicacion.situacion === 'C') {
    return (
      <div className="y-shell y-responsive-page">
        <div className="y-head">
          <Link to="/cliente/inicio" className="y-icon-btn" aria-label="Volver"><ArrowLeft size={18} /></Link>
          <h2 className="font-d" style={{ margin: 0, fontSize: 22 }}>Delivery cancelado</h2>
        </div>
        <div className="y-panel" style={{ padding: 22 }}>
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span style={{ fontSize: 32 }}>❌</span>
            </div>
            <h1 className="font-bold text-gray-900 mb-2">Delivery cancelado</h1>
            <p className="text-gray-600 mb-6">
              Tu delivery fue cancelado. Si crees que es un error, contacta al restaurante para más información.
            </p>
            <div className="mt-8 flex justify-center">
              <Link to="/cliente/inicio" className="y-btn red inline-flex items-center gap-2">
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Seguimiento normal (P / R / E sin pagar) ---------- */
  return (
    <div className="y-shell y-responsive-page">
      <div className="y-head">
        <Link to="/cliente/inicio" className="y-icon-btn" aria-label="Volver"><ArrowLeft size={18} /></Link>
        <h2 className="font-d" style={{ margin: 0, fontSize: 22 }}>Seguimiento delivery</h2>
      </div>
      <div className="y-panel" style={{ padding: 22 }}>
        <>
            <div className="y-track">
              {PASOS.map((p, i) => {
                const done = idx >= 0 && i < idx;
                const now = i === idx;
                return (
                  <div key={p.id} className={`y-tstep ${done ? 'done' : ''} ${now ? 'now' : ''}`}>
                    <div className="dot"><p.icon size={16} /></div>
                    <div>
                      <b>{p.label}</b>
                      <small>{done ? 'Completado' : now ? 'En curso' : 'Pendiente'}</small>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 p-4 rounded-lg border" style={{ borderColor: 'var(--outline-variant)' }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Pedido #{ubicacion.id_pedido}</h3>
                  <div className="text-sm text-gray-500">
                    {ubicacion.direccion_entrega || '—'}{ubicacion.distrito ? `, ${ubicacion.distrito}` : ''}
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  ubicacion.situacion === 'R' ? 'bg-yellow-100 text-yellow-800' :
                  ubicacion.situacion === 'E' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {ESTADO_LABEL[ubicacion.situacion]}
                </span>
              </div>
              {ubicacion.items && ubicacion.items.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold tracking-wider uppercase text-gray-500">Platos del pedido</h4>
                    <span className="text-xs font-medium text-gray-700">{ubicacion.items.length} ítem(es)</span>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {ubicacion.items.map((item) => (
                      <div key={item.idProducto} className="flex justify-between items-start text-sm">
                        <div className="flex-1">
                          <p className="m-0 text-gray-700">{item.cantidad}× {item.nombre}</p>
                          {item.nota && <p className="m-0 text-[10px] text-gray-500 italic">Nota: {item.nota}</p>}
                        </div>
                        <p className="m-0 font-medium text-gray-900 text-right">S/ {item.subTotal.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-700 font-bold">S/ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Envío</span>
                  <span className="text-gray-700 font-medium">S/ {envio.toFixed(2)}{ubicacion.costo_envio_confirmado === false ? ' (estimado)' : ''}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#7F1518] mt-1">
                  <span>Total a pagar</span>
                  <span className="text-gray-700 font-bold">S/ {total.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Método de pago</span>
                  <span className="text-gray-700 font-medium">{ubicacion.metodoPago || '—'}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Ya pagado</span>
                  <span className="text-gray-700 font-medium">S/ {yaPagado.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold">
                  <span className={montoPorCobrar > 0 ? 'text-[#DC3545]' : 'text-[#22C55E]'}>
                    {montoPorCobrar > 0 ? `Por cobrar: S/ ${montoPorCobrar.toFixed(2)}` : 'Pagado en su totalidad'}
                  </span>
                </div>
                {ubicacion.costo_envio_confirmado === false && (
                  <p className="mt-2 text-[10px] text-amber-700">
                    El costo de envío aún no ha sido confirmado por el local. El total puede variar.
                  </p>
                )}
              </div>
              <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-sm">
                  <p className="text-[10px] font-bold tracking-wider uppercase text-gray-500">Salida</p>
                  <p className="m-0 text-gray-700">{hora(ubicacion.f_salida)}</p>
                </div>
                <div className="text-sm">
                  <p className="text-[10px] font-bold tracking-wider uppercase text-gray-500">Entrega estimada</p>
                  <p className="m-0 text-gray-700">{hora(ubicacion.f_entrega)}</p>
                </div>
                {ubicacion.repartidor && (
                  <div className="text-sm">
                    <p className="text-[10px] font-bold tracking-wider uppercase text-gray-500">Repartidor</p>
                    <p className="m-0 text-gray-700">{ubicacion.repartidor}</p>
                  </div>
                )}
              </div>

              {ubicacion.situacion === 'R' && (
                <p className="mt-3 text-green-600 text-sm">
                  <b>En ruta desde:</b> {hora(ubicacion.f_salida)}
                  {ubicacion.f_ubicacion && <span> · Última ubicación: {hora(ubicacion.f_ubicacion)}</span>}
                </p>
              )}
            </div>
            {pins.length > 0 ? (
              <div className="mt-6">
                <MapLeaflet pins={pins} readonly center={center} zoom={14} height="300px" />
              </div>
            ) : (
              <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-300">
                <p className="text-sm text-gray-600" style={{ margin: 0 }}>
                  Aún no hay ubicación disponible para mostrar en el mapa.
                </p>
              </div>
            )}
          </>
      </div>
    </div>
  );
}
