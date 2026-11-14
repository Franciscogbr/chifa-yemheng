import { useState, useEffect } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { verComprobante } from '../staff-service';

interface ComprobanteFacturaProps {
  ventaId: number;
  onClose: () => void;
}

export function ComprobanteFactura({ ventaId, onClose }: ComprobanteFacturaProps) {
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
          <p className="mt-2 text-gray-600 text-sm">Cargando factura…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-lg shadow-lg text-center">
          <p className="text-red-600 font-medium">{error || 'No se pudo cargar la factura'}</p>
          <button onClick={onClose} className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const {
    venta,
    pedido,
    cliente,
    cuenta,
    detalles,
    comprobante,
    emisor,
    pagos,
  } = data;

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
  const telefonoCliente = cliente?.telefono ?? cliente?.persona?.telefono ?? '';
  const direccionCliente = cliente?.direccion ?? '';

  const nombreEmisor = emisor?.razon_social || 'Yemheng S.A.C.';
  const rucEmisor = emisor?.ruc || '';
  const dirEmisor = emisor?.direccion_fiscal || '';

  const cajero = venta?.usuario ?? venta?.cajero ?? '—';
  const comensales = pedido?.comensales ?? '—';
  const observacion = cuenta?.observacion ?? pedido?.nota ?? '';
  const estadoVenta = venta?.estado ?? 'E';
  const estadoLabel = estadoVenta === 'A' ? 'ANULADA' : 'EMITIDA';

  const qrData = `${comprobante?.serie ?? 'F001'}-${comprobante?.numero ?? '00000000'}-${total}`;

  const tieneDescuento = descuento > 0;
  const tieneServicio = servicio > 0;
  const tieneObservacion = observacion && observacion.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-[210mm] bg-white p-6 border border-gray-200 shadow-xl print:shadow-none print:border-0 print:bg-white">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-brown-800 tracking-tighter uppercase">YEMHENG</h1>
            <div className="text-xs text-brown-600 uppercase tracking-wider">Chifa Peruano</div>
            <div className="text-xs text-gray-600">{rucEmisor}</div>
          </div>
          <div className="text-right text-xs">
            <div className="font-bold">{comprobante?.serie ?? 'F001'}-{comprobante?.numero ?? '00000000'}</div>
            <div>{fecha} {hora}</div>
            <div className={`mt-1 text-xs font-bold ${estadoVenta === 'A' ? 'text-red-600' : 'text-brown-800'}`}>
              {estadoLabel}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-300">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-brown-800">Factura Electrónica</h2>
            <p className="text-sm text-gray-600">RUC: {rucEmisor}</p>
          </div>
          <div className="text-right text-sm">
            <div className="font-bold">{comprobante?.serie ?? 'F001'}-{comprobante?.numero ?? '00000000'}</div>
            <div>{fecha} {hora}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-2 rounded border border-gray-200">
            <div className="text-xs text-gray-500 uppercase">Razón Social</div>
            <div className="text-sm font-bold">{nombreCliente}</div>
            <div className="text-xs text-gray-600">{tipoDocCliente}: {docCliente}</div>
            {telefonoCliente && (
              <div className="text-xs text-gray-600">Tel: {telefonoCliente}</div>
            )}
            <div className="text-xs text-gray-600 font-semibold">
              {direccionCliente || 'Dirección no registrada'}
            </div>
          </div>
          <div className="bg-gray-50 p-2 rounded border border-gray-200">
            <div className="text-xs text-gray-500 uppercase">Atendió / Mesa</div>
            <div className="text-sm font-bold">{cajero}</div>
            <div className="text-xs text-gray-600">Mesa {pedido?.id_mesa ?? '—'}</div>
            <div className="text-xs text-gray-600">Comensales: {comensales}</div>
          </div>
        </div>

        {tieneObservacion && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-3">
            <div className="text-xs text-yellow-700 uppercase font-semibold mb-1">Observación</div>
            <div className="text-sm text-yellow-800">{observacion}</div>
          </div>
        )}

        <table className="w-full text-sm border-collapse mb-4">
          <thead>
            <tr className="bg-brown-50 text-brown-700 text-xs border-b border-gray-200">
              <th className="px-2 py-1 text-left font-semibold">Producto</th>
              <th className="px-2 py-1 text-right font-semibold">Cant.</th>
              <th className="px-2 py-1 text-right font-semibold">P. Unit.</th>
              {tieneDescuento ? (
                <th className="px-2 py-1 text-right font-semibold">Desc.</th>
              ) : null}
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
                  {tieneDescuento ? (
                    <td className="px-2 py-1 text-right">{descItem.toFixed(2)}</td>
                  ) : null}
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
                const metodo =
                  pago.metodoPagoId === 1 ? 'Efectivo' :
                  pago.metodoPagoId === 2 ? 'Tarjeta' :
                  'Yape/Plin';
                const referencia = pago.referencia;
                return (
                  <div key={i} className="px-2 py-1 bg-gray-50 rounded border border-gray-200">
                    <div className="text-xs text-gray-500">{metodo}</div>
                    <div className="text-xs font-bold text-right">{Number(pago.monto).toFixed(2)}</div>
                    {referencia && (
                      <div className="text-[10px] text-gray-400 text-right mt-0.5">Ref: {referencia}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-4">
          <div className="flex-shrink-0">
            <QRCode value={qrData} size={60} />
          </div>
          <div className="flex-1 text-sm text-gray-600">
            <div className="font-medium">Código de Verificación</div>
            <div className="text-xs text-gray-500">{qrData}</div>
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
            onClick={() => {
              window.print();
            }}
            className="px-4 py-2 bg-brown-600 text-white rounded hover:bg-brown-700"
          >
            Imprimir
          </button>
          <button
            onClick={() => {
              window.print();
            }}
            className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700"
          >
            PDF
          </button>
        </div>
      </div>
    </div>
  );
}
