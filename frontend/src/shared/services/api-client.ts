import type { DeliveryListaShared, DeliveryShared, PorRendirShared } from '../types/delivery';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1';
const CLIENTE_TOKEN_KEY = 'chifa.cliente.token';
const STAFF_TOKEN_KEY = 'chifa.token';

/** Resuelve el JWT desde localStorage según el guard del endpoint (cliente vs staff/repartidor). */
function resolveToken(endpoint: string): string | null {
  return localStorage.getItem(endpoint.startsWith('/cliente') ? CLIENTE_TOKEN_KEY : STAFF_TOKEN_KEY);
}

function buildQuery(params?: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  }
  return query.toString();
}

class ApiClient {
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = resolveToken(endpoint);
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'UNKNOWN_ERROR' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // Auth
  login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Cliente Delivery
  crearDelivery(data: {
    items: Array<{ productoId: number; cantidad: number; nota?: string }>;
    direccion: string;
    distritoId: number;
    referencia?: string;
    telefono?: string;
    latCliente?: number;
    lngCliente?: number;
  }) {
    return this.request<{ idPedidoDelivery: number; situacion: string; costoEnvio: number; costoConfirmado: boolean }>('/cliente/delivery', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getDeliveryActivoCliente() {
    return this.request<{ idPedidoDelivery: number | null }>('/cliente/delivery');
  }

  sugerirCosto(distrito: number, lat?: number, lng?: number) {
    const params = new URLSearchParams({ distrito: String(distrito) });
    if (lat !== undefined && lng !== undefined) {
      params.set('lat', String(lat));
      params.set('lng', String(lng));
    }
    return this.request<{ distanciaKm: number | null; fueraRadio: boolean; dentroCobertura: boolean; costoSugerido: number }>(
      `/cliente/delivery/sugerir-costo?${params.toString()}`
    );
  }

  getCoberturaDelivery() {
    return this.request<{
      latLocal: number | null;
      lngLocal: number | null;
      direccionLocal: string | null;
      radioCoberturaKm: number | null;
    }>('/cliente/delivery/cobertura');
  }

  getDeliveryDetalle(id: number) {
    return this.request<any>(`/cliente/delivery/${id}`);
  }

  getDeliveryUbicacion(id: number) {
    return this.request<any>(`/cliente/delivery/${id}/ubicacion`);
  }

  // Repartidor
  getMisEntregas(params?: { estado?: Array<'P' | 'R' | 'E' | 'C'>; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.estado) query.set('estado', params.estado.join(','));
    if (params?.page !== undefined) query.set('page', String(params.page));
    if (params?.limit !== undefined) query.set('limit', String(params.limit));
    const queryString = query.toString();
    return this.request<DeliveryListaShared>(`/repartidor/entregas${queryString ? `?${queryString}` : ''}`);
  }

  getMiEntrega(id: number) {
    return this.request<DeliveryShared>(`/repartidor/entregas/${id}`);
  }

  iniciarRuta(id: number) {
    return this.request<DeliveryShared>(`/repartidor/entregas/${id}/ruta`, { method: 'PATCH' });
  }

  confirmarEntrega(id: number) {
    return this.request<DeliveryShared>(`/repartidor/entregas/${id}/entregar`, { method: 'PATCH' });
  }

  actualizarUbicacion(id: number, lat: number, lng: number) {
    return this.request<{ ok: boolean }>(`/repartidor/entregas/${id}/ubicacion`, {
      method: 'POST',
      body: JSON.stringify({ lat, lng }),
    });
  }

  getPorRendir() {
    return this.request<PorRendirShared[]>('/repartidor/por-rendir');
  }

  registrarPushToken(token: string, platform: string) {
    return this.request<{ ok: boolean }>('/repartidor/entregas/token', {
      method: 'POST',
      body: JSON.stringify({ token, platform }),
    });
  }

  // Staff Seguimiento
  listarDelivery(filtros?: { page?: number; limit?: number; estado?: string }) {
    const query = buildQuery({
      page: filtros?.page ?? 1,
      limit: filtros?.limit ?? 20,
      estado: filtros?.estado,
    });
    return this.request<any>(`/delivery?${query}`);
  }

  getSeguimiento(params?: { estado?: string; repartidorId?: number; page?: number; limit?: number }) {
    const query = buildQuery(params);
    return this.request<any>(`/delivery/seguimiento${query ? `?${query}` : ''}`);
  }

  getDeliverySeguimiento(id: number) {
    return this.request<any>(`/delivery/seguimiento/${id}`);
  }

  iniciarRutaStaff(id: number) {
    return this.request<any>(`/delivery/seguimiento/${id}/ruta`, { method: 'PATCH' });
  }

  confirmarEntregaStaff(id: number) {
    return this.request<any>(`/delivery/seguimiento/${id}/entregar`, { method: 'PATCH' });
  }

  anularDelivery(id: number, motivo: string) {
    return this.request<any>(`/delivery/seguimiento/${id}/anular`, {
      method: 'PATCH',
      body: JSON.stringify({ motivo }),
    });
  }

  getUbicacionSeguimiento(id: number) {
    return this.request<any>(`/delivery/seguimiento/${id}/ubicacion`);
  }

  // Rendiciones
  getPendientesRendicion(repartidorId: number) {
    return this.request<any>(`/rendiciones/pendientes?repartidorId=${repartidorId}`);
  }

  registrarRendicion(data: { repartidorId: number; pedidoIds: number[]; montoEntregado: number; observaciones?: string }) {
    return this.request<any>('/rendiciones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  validarRendicion(id: number) {
    return this.request<{ ok: boolean }>(`/rendiciones/${id}/validar`, { method: 'PATCH' });
  }

  observarRendicion(id: number, motivo: string) {
    return this.request<{ ok: boolean }>(`/rendiciones/${id}/observar`, {
      method: 'PATCH',
      body: JSON.stringify({ motivo }),
    });
  }

  getRendicionPdf(id: number) {
    return this.request<any>(`/rendiciones/${id}/pdf`);
  }

  // Maestros
  getProductos(params?: { estado?: boolean; disponible?: boolean }) {
    const query = new URLSearchParams();
    if (params?.estado !== undefined) query.set('estado', params.estado ? 'A' : 'I');
    if (params?.disponible !== undefined) query.set('disponible', params.disponible ? 'S' : 'N');
    return this.request<{ data: any[] }>(`/productos?${query.toString()}`).then(r => r.data);
  }

  getCategorias() {
    return this.request<{ data: any[] }>(`/categorias`).then(r => r.data);
  }

  getDepartamentos() {
    return this.request<any[]>(`/maestros/departamentos`);
  }

  getProvincias(departamento?: number) {
    const query = departamento === undefined ? '' : `?departamento=${departamento}`;
    return this.request<any[]>(`/maestros/provincias${query}`);
  }

  getDistritos(provincia?: number) {
    const query = provincia === undefined ? '' : `?provincia=${provincia}`;
    return this.request<any[]>(`/maestros/distritos${query}`);
  }

  // Delivery Staff
  getDeliveries(params?: { page?: number; limit?: number; estado?: string }) {
    const query = buildQuery(params);
    return this.request<any>(`/delivery${query ? `?${query}` : ''}`);
  }

  getDelivery(id: number) {
    return this.request<any>(`/delivery/${id}`);
  }

  asignarRepartidor(deliveryId: number, repartidorId: number) {
    return this.request<any>(`/delivery/${deliveryId}/asignar`, {
      method: 'PATCH',
      body: JSON.stringify({ repartidorId }),
    });
  }
}

export const api = new ApiClient();