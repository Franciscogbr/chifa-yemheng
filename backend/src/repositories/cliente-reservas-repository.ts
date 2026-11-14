import { supabase } from '../config/supabase.js';

export class ClienteReservaError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

export interface ContinuacionReservaCliente {
  reservaId: number;
  mesaId: number | null;
  pedidoId: number | null;
  canalAtencion: 'QR' | 'MOZO' | null;
}

export async function obtenerContinuacionReservaCliente(
  reservaId: number,
  clienteId: number,
): Promise<ContinuacionReservaCliente | null> {
  const { data: reserva, error: reservaError } = await supabase
    .from('reserva')
    .select('id_reserva, id_mesa, situacion, f_llegada, canal_atencion')
    .eq('id_reserva', reservaId)
    .eq('id_cliente', clienteId)
    .eq('estado', 'A')
    .maybeSingle();

  if (reservaError) throw new Error(`DB_GET_FAIL: ${reservaError.message}`);
  if (!reserva) return null;

  const { data: pedido, error: pedidoError } = await supabase
    .from('pedido')
    .select('id_pedido')
    .eq('id_reserva', reservaId)
    .order('id_pedido', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (pedidoError) throw new Error(`DB_GET_FAIL: ${pedidoError.message}`);
  if (pedido) {
    return {
      reservaId: Number(reserva.id_reserva),
      mesaId: reserva.id_mesa == null ? null : Number(reserva.id_mesa),
      pedidoId: Number(pedido.id_pedido),
      canalAtencion: reserva.canal_atencion === 'QR' || reserva.canal_atencion === 'MOZO'
        ? reserva.canal_atencion
        : null,
    };
  }

  if (reserva.situacion !== 'A' || reserva.f_llegada == null || reserva.id_mesa == null) {
    throw new ClienteReservaError('RESERVA_CONTINUAR_NO_DISPONIBLE');
  }

  return {
    reservaId: Number(reserva.id_reserva),
    mesaId: Number(reserva.id_mesa),
    pedidoId: null,
    canalAtencion: reserva.canal_atencion === 'QR' || reserva.canal_atencion === 'MOZO'
      ? reserva.canal_atencion
      : null,
  };
}

export async function cancelarReservaCliente(
  reservaId: number,
  clienteId: number,
  usuario: string,
  pc: string,
): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.rpc('fn_cancelar_reserva_cliente', {
    p_reserva: reservaId,
    p_cliente: clienteId,
    p_usuario: usuario,
    p_pc: pc,
  });

  if (error) {
    const knownCodes = [
      'RESERVA_NOT_FOUND',
      'RESERVA_ESTADO_INVALIDO',
      'RESERVA_CON_PEDIDO',
      'MESA_NOT_FOUND',
    ];
    const code = knownCodes.find((candidate) => error.message.includes(candidate));
    if (code) throw new ClienteReservaError(code);
    throw new Error(`DB_CANCEL_FAIL: ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== 'object') {
    throw new Error('DB_CANCEL_FAIL: no se recibió la reserva cancelada');
  }
  return row as Record<string, unknown>;
}
