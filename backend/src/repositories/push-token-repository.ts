import { supabase } from '../config/supabase.js';

export async function registrarTokenDispositivo(
  empleadoId: number,
  token: string,
  plataforma: 'web' | 'android' | 'ios',
): Promise<void> {
  const { error } = await supabase.from('dispositivo_token').upsert(
    {
      id_empleado: empleadoId,
      token,
      plataforma,
      activo: true,
    },
    { onConflict: 'token' },
  );
  if (error) throw new Error(`PUSH_TOKEN_REGISTER_FAIL: ${error.message}`);
}

export async function eliminarTokenDispositivo(empleadoId: number, token: string): Promise<void> {
  const { error } = await supabase
    .from('dispositivo_token')
    .delete()
    .eq('id_empleado', empleadoId)
    .eq('token', token);
  if (error) throw new Error(`PUSH_TOKEN_DELETE_FAIL: ${error.message}`);
}
