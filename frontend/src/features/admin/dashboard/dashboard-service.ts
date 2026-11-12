import { leerToken } from '../../auth/login/auth-service';
import type { DashboardResumen } from './dashboard-types';

import { API_URL } from '../../../lib/api-url';

const BASE = `${API_URL}/dashboard`;

export async function resumenDashboard(): Promise<DashboardResumen> {
  const res = await fetch(`${BASE}/resumen`, {
    headers: { Authorization: `Bearer ${leerToken() ?? ''}` },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'NETWORK_ERROR');
  }
  return (await res.json()) as DashboardResumen;
}
