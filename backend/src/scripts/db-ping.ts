import { supabase } from '../config/supabase.js';

/** Verifica conexión a RESTAURANTEV3 y presencia del seed de módulos. */
async function main(): Promise<void> {
  const { data, error } = await supabase.from('modulo').select('n_modulo').order('orden');
  if (error) {
    // eslint-disable-next-line no-console
    console.error('DB_PING_FAIL:', error.message);
    process.exit(1);
  }
  // eslint-disable-next-line no-console
  console.log(`DB_PING_OK: ${(data ?? []).length} modulos`);
  // eslint-disable-next-line no-console
  console.log((data ?? []).map((m) => m.n_modulo).join(', '));
}

void main();
