import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../repositories/push-token-repository.js', () => ({
  eliminarTokenDispositivo: vi.fn().mockResolvedValue(undefined),
  registrarTokenDispositivo: vi.fn().mockResolvedValue(undefined),
}));

import { deletePushToken, postPushToken } from '../push-token-controller.js';
import {
  eliminarTokenDispositivo,
  registrarTokenDispositivo,
} from '../../repositories/push-token-repository.js';

function makeRequest(body: unknown, tipo = 'REPARTIDOR'): Request {
  return {
    body,
    user: {
      sub: 11,
      logeo: 'repartidor',
      tipo,
      roles: [tipo],
      permisos: ['DELIVERY_VER'],
      authVersion: 1,
      empleadoId: 42,
    },
  } as unknown as Request;
}

function makeResponse(): Response {
  const response = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return response as unknown as Response;
}

describe('push token controller', () => {
  beforeEach(() => vi.clearAllMocks());

  it('binds registration to the employee from the authenticated session', async () => {
    const req = makeRequest({ token: 'fcm-device-token', platform: 'web', userId: 999 });
    const res = makeResponse();

    await postPushToken(req, res);

    expect(registrarTokenDispositivo).toHaveBeenCalledWith(42, 'fcm-device-token', 'web');
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('deletes only the authenticated employee token', async () => {
    const req = makeRequest({ token: 'fcm-device-token', userId: 999 });
    const res = makeResponse();

    await deletePushToken(req, res);

    expect(eliminarTokenDispositivo).toHaveBeenCalledWith(42, 'fcm-device-token');
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it('rejects token registration for non-delivery staff', async () => {
    const req = makeRequest({ token: 'fcm-device-token', platform: 'web' }, 'CAJERO');
    const res = makeResponse();

    await postPushToken(req, res);

    expect(registrarTokenDispositivo).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
