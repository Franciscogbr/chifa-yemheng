import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import WebSocketPolyfill from 'ws';
import { env } from './env.js';

// Node 20 no trae WebSocket global (lo exige @supabase/realtime-js).
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = WebSocketPolyfill as unknown as typeof WebSocket;
}

/**
 * Cliente Supabase con service_role — SOLO backend.
 * El frontend NUNCA accede directo a Supabase (todo pasa por /api/v1).
 */
export const supabase: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);
