import { useEffect, useState } from 'react';
import { api } from '@/shared/services/api-client';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { MapLeaflet } from '@/shared/ui/MapLeaflet';
import { useToast } from '@/shared/ui/use-toast';
import { listarClientes } from '@/features/admin/clientes/clientes-service';
import type { Cliente as ClienteRegistro } from '@/features/admin/clientes/clientes-types';

interface Producto {
  id_producto: number;
  nombre: string;
  precio: number;
  id_categoria: number;
}

interface Categoria {
  id_categoria: number;
  nombre: string;
}

interface Distrito {
  id_distrito: number;
  d_distrito: string;
  id_provincia: number;
}

interface Provincia {
  id_provincia: number;
  d_provincia: string;
  id_departamento: number;
}

interface Departamento {
  id_departamento: number;
  d_departamento: string;
}

interface ItemCarrito {
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  nota?: string;
}

interface CrearDeliveryModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onExito: () => void;
}

export function CrearDeliveryModal({ abierto, onCerrar, onExito }: CrearDeliveryModalProps) {
  const { toast } = useToast();
  const [mostrarHero, setMostrarHero] = useState(true);
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);

  const [clienteId, setClienteId] = useState<number | null>(null);
  const [clienteBuscar, setClienteBuscar] = useState('');
  const [clientes, setClientes] = useState<ClienteRegistro[]>([]);
  const [mostrarClientes, setMostrarClientes] = useState(false);

  const [direccion, setDireccion] = useState('');
  const [referencia, setReferencia] = useState('');
  const [telefono, setTelefono] = useState('');
  const [departamentoId, setDepartamentoId] = useState<number | null>(null);
  const [provinciaId, setProvinciaId] = useState<number | null>(null);
  const [distritoId, setDistritoId] = useState<number | null>(null);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [costoEnvio, setCostoEnvio] = useState(0);
  const [costoSugerido, setCostoSugerido] = useState<number | null>(null);
  const [fueraRadio, setFueraRadio] = useState(false);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<number | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [buscarProducto, setBuscarProducto] = useState('');
  const [items, setItems] = useState<ItemCarrito[]>([]);

  const [mapPins] = useState<Array<{ lat: number; lng: number; label?: string; color?: 'blue' | 'red' | 'green'; id_provincia?: number }>>([]);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [radioCoberturaKm] = useState(5);

  useEffect(() => {
    const timer = window.setTimeout(() => setMostrarHero(false), 8000);
    return () => window.clearTimeout(timer);
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      const [cats, deps, clientesRes] = await Promise.all([
        api.getCategorias(),
        api.getDepartamentos(),
        listarClientes({ page: 1, limit: 100, buscar: '', tipo: '', estado: 'A', orden: 'alpha' }),
      ]);

      setCategorias(cats);
      setDepartamentos(deps);
      setClientes(clientesRes.data);

      if (cats.length > 0) {
        setCategoriaActiva(cats[0].id_categoria);
      }

      if (deps.length > 0) {
        setDepartamentoId(deps[0].id_departamento);
      }
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      toast({
        title: 'No se pudieron cargar los datos del delivery',
        description: error instanceof Error ? error.message : 'Inténtalo nuevamente.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    void cargarDatosIniciales();
  }, []);

  useEffect(() => {
    const buscar = clienteBuscar.trim();
    if (!mostrarClientes || buscar.length < 2) return;

    let vigente = true;
    const timer = window.setTimeout(() => {
      void listarClientes({ page: 1, limit: 30, buscar, tipo: '', estado: 'A', orden: 'alpha' })
        .then((resultado) => {
          if (vigente) setClientes(resultado.data);
        })
        .catch((error: unknown) => {
          if (!vigente) return;
          toast({
            title: 'No se pudieron buscar los clientes',
            description: error instanceof Error ? error.message : 'Inténtalo nuevamente.',
            variant: 'destructive',
          });
        });
    }, 250);
    return () => {
      vigente = false;
      window.clearTimeout(timer);
    };
  }, [clienteBuscar, mostrarClientes, toast]);

  useEffect(() => {
    if (!departamentoId) {
      setProvincias([]);
      setProvinciaId(null);
      setDistritos([]);
      setDistritoId(null);
      return;
    }

    void api.getProvincias(departamentoId).then(setProvincias);
    setProvinciaId(null);
    setDistritoId(null);
    setDistritos([]);
  }, [departamentoId]);

  useEffect(() => {
    if (!provinciaId) {
      setDistritos([]);
      setDistritoId(null);
      return;
    }

    void api.getDistritos(provinciaId).then(setDistritos);
    setDistritoId(null);
  }, [provinciaId]);

  useEffect(() => {
    if (!categoriaActiva) {
      setProductos([]);
      return;
    }

    void api.getProductos({ disponible: true }).then((prods) => {
      setProductos(prods.filter((p) => p.id_categoria === categoriaActiva));
    });
  }, [categoriaActiva]);

  const reverseGeocodeAdmin = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
        {
          headers: { 'User-Agent': 'ChifaYemheng/1.0' },
        }
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();
      const address = data?.address;
      if (!address) return;

      const partes: string[] = [];
      if (address.road) partes.push(address.road);
      if (address.house_number) partes.push(`Nro. ${address.house_number}`);
      if (address.suburb) partes.push(address.suburb);
      if (address.neighbourhood) partes.push(address.neighbourhood);
      if (address.city) partes.push(address.city);
      if (address.town) partes.push(address.town);
      if (address.county) partes.push(address.county);

      const direccionCompleta = partes.join(', ');
      if (direccionCompleta) {
        setDireccion(direccionCompleta);
      }
    } catch (error) {
      console.error('Error en reverse geocoding admin:', error);
    }
  };

  const agregarItem = (producto: Producto) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productoId === producto.id_producto);
      if (existing) {
        return prev.map((i) =>
          i.productoId === producto.id_producto ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }

      return [
        ...prev,
        {
          productoId: producto.id_producto,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: 1,
        },
      ];
    });
  };

  const subtotal = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const total = subtotal + costoEnvio;

  const handleSugerirCosto = async () => {
    if (!distritoId) return;

    try {
      const res = await api.sugerirCosto(distritoId);
      if (!Number.isFinite(res.costoSugerido) || res.costoSugerido < 0) {
        throw new Error('El costo sugerido recibido no es válido.');
      }
      setCostoSugerido(res.costoSugerido);
      setFueraRadio(res.fueraRadio);
      setCostoEnvio(res.costoSugerido);
    } catch (error) {
      console.error('Error sugiriendo costo:', error);
      toast({ title: 'Error calculando costo de envío', description: error instanceof Error ? error.message : 'No se pudo calcular el costo de envío.', variant: 'destructive' });
    }
  };

  const handleSubmit = async () => {
    if (!clienteId) {
      toast({ title: 'Seleccione un cliente', variant: 'destructive' });
      return;
    }
    if (!direccion.trim()) {
      toast({ title: 'Dirección obligatoria', variant: 'destructive' });
      return;
    }
    if (!distritoId) {
      toast({ title: 'Distrito obligatorio', variant: 'destructive' });
      return;
    }
    if (!telefono.trim()) {
      toast({ title: 'Teléfono obligatorio', variant: 'destructive' });
      return;
    }
    if (items.length === 0) {
      toast({ title: 'Agregue al menos un producto', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await api.request('/delivery', {
        method: 'POST',
        body: JSON.stringify({
          clienteId,
          items: items.map((item) => ({
            productoId: item.productoId,
            cantidad: item.cantidad,
            nota: item.nota,
          })),
          direccion,
          distritoId,
          referencia,
          telefono,
          costoEnvio,
        }),
      });

      toast({ title: 'Delivery creado exitosamente', variant: 'success' });
      onExito();
      onCerrar();
    } catch (error: any) {
      toast({ title: 'Error creando delivery', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const renderMapa = () => {
    const pinsFiltrados = provinciaId ? mapPins.filter((pin) => pin.id_provincia === provinciaId) : mapPins;

    return (
      <div className="lg:col-span-1">
        <MapLeaflet
          pins={pinsFiltrados}
          center={mapCenter ?? undefined}
          zoom={15}
          drawRadius={radioCoberturaKm}
          provinciaId={provinciaId ?? undefined}
          onClick={(e) => {
            const { lat, lng } = e.latlng;
            setMapCenter([lat, lng]);
            void reverseGeocodeAdmin(lat, lng);
            console.log('Punto local fijado en coordenadas:', { lat, lng });
          }}
          height="300px"
        />
      </div>
    );
  };

  const renderPaso = () => {
    switch (paso) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">1. Seleccionar Cliente</h3>
            <div className="relative">
              <input
                type="text"
                value={clienteBuscar}
                onChange={(e) => {
                  setClienteBuscar(e.target.value);
                  setMostrarClientes(true);
                }}
                placeholder="Buscar cliente por nombre..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {mostrarClientes && clientes.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {clientes
                    .filter((c) => c.nombre.toLowerCase().includes(clienteBuscar.toLowerCase()))
                    .map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => {
                          setClienteId(c.id);
                          setClienteBuscar(c.nombre);
                          setMostrarClientes(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 border-b last:border-0"
                      >
                        {c.nombre}
                      </button>
                    ))}
                </div>
              )}
              {mostrarClientes && clienteBuscar.trim().length >= 2 && clientes.length === 0 && (
                <div className="absolute z-10 w-full mt-1 rounded-lg border bg-white p-3 text-sm text-gray-500 shadow-lg">
                    No se encontraron clientes.
                </div>
              )}
            </div>
            {clienteId && (
              <div className="p-3 bg-green-50 rounded-lg text-green-800">
                Cliente: <strong>{clienteBuscar}</strong>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">2. Dirección de Entrega</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Dirección *</label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Av. Los Incas 123, Urb. El Bosque"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Referencia</label>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Frente al parque, casa azul, 2do piso"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono *</label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="987654321"
                  maxLength={9}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Departamento *</label>
                <select
                  value={departamentoId ?? ''}
                  onChange={(e) => setDepartamentoId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Seleccionar</option>
                  {departamentos.map((d) => (
                    <option key={d.id_departamento} value={d.id_departamento}>
                      {d.d_departamento}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Provincia *</label>
                <select
                  value={provinciaId ?? ''}
                  onChange={(e) => setProvinciaId(e.target.value ? Number(e.target.value) : null)}
                  disabled={!departamentoId}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Seleccionar</option>
                  {provincias.map((p) => (
                    <option key={p.id_provincia} value={p.id_provincia}>
                      {p.d_provincia}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Distrito *</label>
                <select
                  value={distritoId ?? ''}
                  onChange={(e) => setDistritoId(e.target.value ? Number(e.target.value) : null)}
                  disabled={!provinciaId}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Seleccionar</option>
                  {distritos.map((d) => (
                    <option key={d.id_distrito} value={d.id_distrito}>
                      {d.d_distrito}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Costo Envío *</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={costoEnvio}
                    onChange={(e) => {
                      const costo = Number(e.target.value);
                      setCostoEnvio(Number.isFinite(costo) && costo >= 0 ? costo : 0);
                    }}
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <span className="flex items-center text-gray-500">S/</span>
                </div>
                {provinciaId && distritoId && (
                  <div className="mt-1 text-xs text-gray-500">
                    <span className="font-medium text-gray-600">Provincia: </span>
                    <span className="text-blue-600" style={{ marginLeft: '4px' }}>
                      {provincias.find((p) => p.id_provincia === provinciaId)?.d_provincia || ''}
                    </span>
                    <span className="ml-2 text-gray-400">|</span>
                    <span className="font-medium text-gray-600">Distrito: </span>
                    <span className="text-green-600" style={{ marginLeft: '4px' }}>
                      {distritos.find((d) => d.id_distrito === distritoId)?.d_distrito || ''}
                    </span>
                  </div>
                )}
              </div>
              <Button variant="outline" onClick={handleSugerirCosto} disabled={!distritoId}>
                Sugerir por distrito
              </Button>
            </div>

            {costoSugerido !== null && (
              <div
                className={`p-3 rounded-lg ${
                  fueraRadio ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
                }`}
              >
                <span className="font-medium">Costo sugerido: </span>
                <Badge variant={fueraRadio ? 'warning' : 'success'}>S/ {costoSugerido.toFixed(2)}</Badge>
                {fueraRadio && <span className="ml-2 text-sm text-yellow-700">(Fuera de radio)</span>}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setCostoEnvio(costoSugerido)}
                  className="ml-2"
                >
                  Usar
                </Button>
              </div>
            )}

            {renderMapa()}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">3. Productos</h3>
            <div className="flex gap-2 mb-2">
              <select
                value={categoriaActiva ?? ''}
                onChange={(e) => setCategoriaActiva(e.target.value ? Number(e.target.value) : null)}
                className="px-3 py-2 border rounded-lg w-48"
              >
                {categorias.map((c) => (
                  <option key={c.id_categoria} value={c.id_categoria}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={buscarProducto}
                onChange={(e) => setBuscarProducto(e.target.value)}
                placeholder="Buscar producto..."
                className="flex-1 px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {productos
                .filter((p) => p.nombre.toLowerCase().includes(buscarProducto.toLowerCase()))
                .map((p) => (
                  <div key={p.id_producto} className="bg-white border rounded-lg p-3 hover:shadow-md">
                    <p className="font-medium">{p.nombre}</p>
                    <p className="text-sm text-gray-500">S/ {p.precio.toFixed(2)}</p>
                    <Button className="mt-2 w-full" size="sm" onClick={() => agregarItem(p)}>
                      Agregar
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">4. Confirmar Pedido</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {items.map((item, i) => (
                <div key={`${item.productoId}-${i}`} className="flex justify-between text-sm">
                  <span>
                    {item.cantidad}x {item.nombre}
                  </span>
                  <Badge variant="default">S/ {(item.precio * item.cantidad).toFixed(2)}</Badge>
                </div>
              ))}
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>S/ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Envío</span>
                  <span>S/ {costoEnvio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-lg border-t pt-2">
                  <span>Total</span>
                  <span>S/ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
              <strong>Nota:</strong> Este pedido se crea para entrega (delivery). El pago se cobrará contra
              entrega (efectivo) o digital según acuerde con el cliente.
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">Nuevo Delivery Telefónico</h2>
          <Button variant="ghost" onClick={onCerrar} disabled={loading}>
            ✕
          </Button>
        </div>

        {mostrarHero && (
          <section className="y-flow-hero" aria-labelledby="admin-delivery-hero-title">
            <div className="y-flow-hero__content">
              <span className="y-flow-hero__eyebrow">Atención telefónica</span>
              <h3 id="admin-delivery-hero-title" className="y-flow-hero__title">
                Nuevo delivery
              </h3>
              <p className="y-flow-hero__description">
                Registra el pedido del cliente, confirma la dirección y coordina su entrega desde un solo lugar.
              </p>
            </div>
          </section>
        )}

        <div className="px-4 py-3 bg-gray-50 border-b">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {['Cliente', 'Dirección', 'Productos', 'Confirmar'].map((label, index) => (
              <div key={label} className="flex items-center min-w-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index + 1 < paso
                      ? 'bg-green-500 text-white'
                      : index + 1 === paso
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index + 1 < paso ? '✓' : index + 1}
                </div>
                <span className={`ml-1 text-xs ${index + 1 <= paso ? 'text-gray-900' : 'text-gray-400'}`}>
                  {label}
                </span>
                {index < 3 && (
                  <div
                    className={`w-16 h-0.5 mx-1 ${index + 1 < paso ? 'bg-green-500' : 'bg-gray-200'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">{renderPaso()}</div>

        <div className="p-4 border-t flex justify-between">
          <Button variant="secondary" onClick={() => setPaso((p) => Math.max(1, p - 1))} disabled={paso === 1 || loading}>
            Anterior
          </Button>
          <div className="flex gap-2">
            {paso < 4 ? (
              <Button onClick={() => setPaso((p) => Math.min(4, p + 1))} disabled={loading}>
                Siguiente
              </Button>
            ) : (
              <Button onClick={handleSubmit} loading={loading} size="lg">
                {loading ? 'Creando...' : 'Crear Delivery'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
