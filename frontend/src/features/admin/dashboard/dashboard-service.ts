import { leerToken } from '../../auth/login/auth-service';
import type { DashboardResumen } from './dashboard-types';

const BASE = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1'}/dashboard`;

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
