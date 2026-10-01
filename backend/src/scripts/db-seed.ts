import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';

/**
 * Ejecuta openspec/database/permiso_modulo.sql (idempotente: solo inserta
 * módulos/permisos faltantes por n_modulo/clave).
 * Requiere DATABASE_URL en backend/.env (contraseña de la BD, solo local).
 */
async function main(): Promise<void> {
  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) {
    // eslint-disable-next-line no-console
    console.error('DB_SEED_FAIL: falta DATABASE_URL en backend/.env');
    process.exit(1);
  }
  const here = path.dirname(fileURLToPath(import.meta.url));
  const sqlPath = path.resolve(here, '..', '..', '..', 'openspec', 'database', 'permiso_modulo.sql');
  const sql = await readFile(sqlPath, 'utf-8');

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await client.query(sql);
    const { rows } = await client.query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM public.modulo',
    );
    const perms = await client.query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM public.permiso',
    );
    // eslint-disable-next-line no-console
    console.log(`DB_SEED_OK: ${rows[0]?.count} modulos, ${perms.rows[0]?.count} permisos`);
  } finally {
    await client.end();
  }
}

void main();
