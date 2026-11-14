import { useState, useEffect } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { verComprobante } from '../staff-service';

interface ComprobanteTicketProps {
  ventaId: number;
  onClose: () => void;
}

export function ComprobanteTicket({ ventaId, onClose }: ComprobanteTicketProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    verComprobante(ventaId)
      .then(setData)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      })
      .finally(() => setLoading(false));
  }, [ventaId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-10 w-10 text-brown-600"></div>
          <p className="mt-2 text-gray-600 text-sm">Cargando ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-lg shadow-lg text-center">
          <p className="text-red-600 font-medium">{error || 'No se pudo cargar el ticket'}</p>
          <button onClick={onClose} className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const {
    venta,
    detalles,
    comprobante,
    emisor,
    pagos,
  } = data;

  const fecha = venta?.f_venta ? new Date(venta.f_venta).toLocaleDateString('es-PE') : '';
  const hora = venta?.f_venta ? new Date(venta.f_venta).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '';
  const total = Number(venta?.total ?? 0);

  const nombreEmisor = emisor?.razon_social || 'YEMHENG';
  const rucEmisor = emisor?.ruc || '';

  const qrData = `${comprobante?.serie ?? 'TKT'}-${comprobante?.numero ?? '00000000'}-${total}`;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-white">
        <div className="w-full max-w-[80mm] bg-white p-3 border border-gray-200 shadow-xl print:shadow-none print:border-0 print:bg-white">
          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex-1">
              <h1 className="text-sm font-bold text-brown-800 tracking-tighter uppercase">YEMHENG</h1>
              <p className="text-xs text-brown-600 uppercase tracking-wider">Chifa Peruano</p>
              <div className="text-xs text-gray-600">{rucEmisor}</div>
            </div>
            <div className="text-right text-xs">
              <div className="font-bold">{comprobante?.serie ?? 'TKT'}-{comprobante?.numero ?? '00000000'}</div>
              <div>{fecha} {hora}</div>
            </div>
          </div>

          <div className="h-px bg-gray-300 my-2"></div>

          {/* Items */}
          <div className="text-xs mb-2">
            {(detalles ?? []).map((d: any, i: number) => (
              <div key={i} className="flex justify-between mb-1">
                <div className="flex justify-between">
                  <span>{d.producto}</span>
                  <span className="text-right">{Number(d.precio_unitario).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-600">  {d.cantidad} x</span>
                  <span className="text-right">{Number(d.sub_total).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="h-px bg-gray-300 my-1"></div>

          {/* Totals */}
          <div className="text-right text-sm">
            <div className="flex justify-between">
              <span>Total</span>
              <span className="font-bold">{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payments */}
          {(pagos ?? []).length > 0 && (
            <div className="mb-1 text-xs">
              {(pagos as any[]).map((pago: any, i: number) => (
                <div key={i} className="flex justify-between">
                  <span>{pago.metodoPagoId === 1 ? 'Efectivo' : pago.metodoPagoId === 2 ? 'Tarjeta' : 'Yape/Plin'}</span>
                  <span className="text-right">{Number(pago.monto).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="h-px bg-gray-300 my-1"></div>

          {/* QR */}
          <div className="flex items-center gap-2 mb-1">
            <div className="flex-shrink-0">
              <QRCode value={qrData} size={40} />
            </div>
            <div className="flex-1 text-[10px] text-gray-600">
              <div>{qrData}</div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-2 pt-2 border-t border-gray-200 text-center text-xs text-gray-500">
            <div>{nombreEmisor}</div>
            <div>{rucEmisor}</div>
            <div>Gracias por su compra</div>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => {
                window.print();
              }}
              className="px-3 py-1 bg-brown-600 text-white rounded text-xs hover:bg-brown-700"
            >
              Imprimir
            </button>
            <button
              onClick={() => {
                window.print();
              }}
              className="px-3 py-1 bg-gray-900 text-white rounded text-xs hover:bg-gray-700"
            >
              PDF
            </button>
          </div>
        </div>
      </div>
      </>
  );
}