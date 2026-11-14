import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Receipt, FileText, ArrowLeft } from 'lucide-react';
import { Loading } from '../../../components/ui';
import { useClienteAuth } from '../auth/cliente-auth-context';
import { API_URL } from '../../../lib/api-url';

export function ClienteComprobantePage() {
  const { id } = useParams();
  const { token } = useClienteAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !id) return;
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/cliente/pedidos/${id}/comprobante`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? 'No se pudo cargar el comprobante.');
        }
        return res.json();
      })
      .then(setData)
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'No se pudo cargar el comprobante.');
      })
      .finally(() => setLoading(false));
  }, [token, id]);

  if (loading) return (
    <div className="y-shell" style={{ padding: 24 }}><Loading text="Cargando comprobante…" /></div>
  );

  if (error || !data) {
    return (
      <div className="y-shell" style={{ padding: '24px 16px 140px', maxWidth: 480, margin: '0 auto' }}>
        <div className="y-panel" style={{ padding: 24, textAlign: 'center' }}>
          <Receipt size={32} style={{ marginBottom: 12 }} />
          <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Comprobante no disponible</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>{error || 'No se encontró el comprobante.'}</p>
          <Link className="y-btn line" to="/cliente/historial" style={{ marginTop: 16, display: 'inline-flex' }}>Volver al historial</Link>
        </div>
      </div>
    );
  }

  const { venta, pedido, cliente, comprobante, emisor, pagos, detalles } = data;

  const fecha = venta?.f_venta ? new Date(venta.f_venta).toLocaleDateString('es-PE') : '';
  const hora = venta?.f_venta ? new Date(venta.f_venta).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '';
  const total = Number(venta?.total ?? 0);
  const subtotal = Number(venta?.subtotal ?? 0);
  const igv = Number(venta?.igv ?? 0);
  const descuento = Number(venta?.descuento ?? 0);
  const servicio = Number(venta?.servicio ?? 0);

  const nombreCliente = cliente?.persona
    ? `${cliente.persona.nombre} ${cliente.persona.ap_paterno ?? ''} ${cliente.persona.ap_materno ?? ''}`.trim()
    : cliente?.razon_social || 'Cliente';
  const docCliente = cliente?.persona?.n_documento || cliente?.ruc || '';
  const tipoDocCliente = cliente?.tipo_identidad?.n_tipoidentidad || 'RUC';

  const nombreEmisor = emisor?.razon_social || 'YEMHENG';
  const rucEmisor = emisor?.ruc || '';
  const dirEmisor = emisor?.direccion_fiscal || '';

  const cajero = venta?.usuario ?? venta?.cajero ?? '—';
  const estadoVenta = venta?.estado ?? 'E';
  const estadoLabel = estadoVenta === 'A' ? 'ANULADA' : 'EMITIDA';

  const qrData = `${comprobante?.serie ?? 'B001'}-${comprobante?.numero ?? '00000000'}-${total}`;

  const tieneDescuento = descuento > 0;
  const tieneServicio = servicio > 0;

  const tipoDocLabel = venta?.tipodocumento === '01' ? 'Factura Electrónica' : 'Boleta Electrónica';

  return (
    <div className="y-shell" style={{ padding: '24px 16px 140px', maxWidth: 900, margin: '0 auto' }}>
      <div className="flex items-center justify-between mb-6">
        <Link to="/cliente/historial" className="flex items-center gap-2 y-icon-btn" aria-label="Volver">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="font-d" style={{ margin: 0, fontSize: 22 }}>Comprobante de venta</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>
            {tipoDocLabel} · {comprobante?.serie ?? '—'}-{comprobante?.numero ?? '—'}
          </p>
        </div>
      </div>

      {error && <div className="y-panel" style={{ padding: 16, textAlign: 'center' }}>{error}</div>}

      {data && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 24, background: '#fff' }}>
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-brown-800 tracking-tighter uppercase">{nombreEmisor}</h1>
              <div className="text-xs text-brown-600 uppercase tracking-wider">Chifa Peruano</div>
              <div className="text-xs text-gray-600">RUC: {rucEmisor}</div>
            </div>
            <div className="text-right text-xs">
              <div className="font-bold">{comprobante?.serie ?? '—'}-{comprobante?.numero ?? '—'}</div>
              <div>{fecha} {hora}</div>
              <div className={`mt-1 text-xs font-bold ${estadoVenta === 'A' ? 'text-red-600' : 'text-brown-800'}`}>
                {estadoLabel}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-300">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-brown-800">{tipoDocLabel}</h2>
              <p className="text-sm text-gray-600">RUC: {rucEmisor}</p>
            </div>
            <div className="text-right text-sm">
              <div className="font-bold">{comprobante?.serie ?? '—'}-{comprobante?.numero ?? '—'}</div>
              <div>{fecha} {hora}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-2 rounded border border-gray-200">
              <div className="text-xs text-gray-500 uppercase">Cliente</div>
              <div className="text-sm font-bold">{nombreCliente}</div>
              <div className="text-xs text-gray-600">{tipoDocCliente}: {docCliente}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded border border-gray-200">
              <div className="text-xs text-gray-500 uppercase">Atendió / Mesa</div>
              <div className="text-sm font-bold">{cajero}</div>
              <div className="text-xs text-gray-600">Mesa {pedido?.id_mesa ?? '—'}</div>
            </div>
          </div>

          <table className="w-full text-sm border-collapse mb-4">
            <thead>
              <tr className="bg-brown-50 text-brown-700 text-xs border-b border-gray-200">
                <th className="px-2 py-1 text-left font-semibold">Producto</th>
                <th className="px-2 py-1 text-right font-semibold">Cant.</th>
                <th className="px-2 py-1 text-right font-semibold">P. Unit.</th>
                {tieneDescuento ? <th className="px-2 py-1 text-right font-semibold">Desc.</th> : null}
                <th className="px-2 py-1 text-right font-semibold">Importe</th>
              </tr>
            </thead>
            <tbody>
              {(detalles ?? []).map((d: any, i: number) => {
                const descItem = Number(d.descuento ?? 0);
                return (
                  <tr key={i} className="border-b border-gray-100 last:border-0">
                    <td className="px-2 py-1">{d.producto}</td>
                    <td className="px-2 py-1 text-right">{d.cantidad}</td>
                    <td className="px-2 py-1 text-right">{Number(d.precio_unitario).toFixed(2)}</td>
                    {tieneDescuento ? <td className="px-2 py-1 text-right">{descItem.toFixed(2)}</td> : null}
                    <td className="px-2 py-1 text-right font-bold">{Number(d.sub_total).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex flex-col gap-1 mb-4 text-right">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>{subtotal.toFixed(2)}</span>
            </div>
            {tieneDescuento && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Descuento</span>
                <span className="text-red-600">-{descuento.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">IGV (18%)</span>
              <span>{igv.toFixed(2)}</span>
            </div>
            {tieneServicio && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Servicio</span>
                <span>{servicio.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold">
              <span className="text-gray-800">Total</span>
              <span className="text-brown-800">{total.toFixed(2)}</span>
            </div>
          </div>

          {(pagos ?? []).length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-gray-500 uppercase mb-1">Formas de Pago</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {(pagos as any[]).map((pago: any, i: number) => {
                  const metodo = pago.metodoPagoId === 1 ? 'Efectivo' : pago.metodoPagoId === 2 ? 'Tarjeta' : 'Yape/Plin';
                  const referencia = pago.referencia;
                  return (
                    <div key={i} className="px-2 py-1 bg-gray-50 rounded border border-gray-200">
                      <div className="text-xs text-gray-500">{metodo}</div>
                      <div className="text-xs font-bold text-right">{Number(pago.monto).toFixed(2)}</div>
                      {referencia && <div className="text-[10px] text-gray-400 text-right mt-0.5">Ref: {referencia}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="text-[10px] text-gray-600 text-center">Código de verificación</div>
              <div className="flex items-center justify-center">
                <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ background: '#fff', padding: 4 }}>
                  <foreignObject width="100%" height="100%">
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontFamily: 'monospace' }}>
                      {qrData}
                    </div>
                  </foreignObject>
                </svg>
              </div>
              <div className="text-[10px] text-gray-500 text-center mt-1">{qrData}</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
            <div>{nombreEmisor}</div>
            <div>{rucEmisor}</div>
            <div>{dirEmisor}</div>
            <div className="mt-1">Gracias por su compra</div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-brown-600 text-white rounded hover:bg-brown-700 text-sm font-semibold"
            >
              <FileText size={16} /> Imprimir
            </button>
            <button
              onClick={() => {
                const html = document.documentElement.innerHTML;
                const printWindow = window.open('', '_blank');
                printWindow?.document.write(`
                  <html><head><title>Comprobante</title></head>
                  <body style="font-family: sans-serif;">${html}</body>
                </html>`);
                printWindow?.document.close();
                printWindow?.focus();
                printWindow?.print();
                printWindow?.close();
              }}
              className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700 text-sm font-semibold"
            >
              <FileText size={16} /> PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
