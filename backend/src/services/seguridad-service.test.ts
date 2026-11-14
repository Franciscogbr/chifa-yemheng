import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  crearUsuario: vi.fn(),
  actualizarUsuario: vi.fn(),
  guardarRol: vi.fn(),
}));

vi.mock('../repositories/seguridad-repository.js', () => ({
  actualizarUsuario: mocks.actualizarUsuario,
  asignarPermisosRol: vi.fn(),
  guardarRol: mocks.guardarRol,
  crearUsuario: mocks.crearUsuario,
  listarPermisos: vi.fn(),
  listarRoles: vi.fn(),
  listarUsuarios: vi.fn(),
  listarTiposUsuario: vi.fn(),
  listarPermisosDeRol: vi.fn(),
}));

import { actualizarUsuarioService, crearUsuarioService, guardarRolService } from './seguridad-service.js';

const actor = {
  id: 1,
  logeo: 'admin',
  tipo: 'ADMINISTRADOR',
  permisos: ['SEG_USUARIO', 'SEG_ROL'],
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('seguridad-service user-role errors', () => {
  it('surfaces missing matching role during user creation', async () => {
    mocks.crearUsuario.mockRejectedValue(new Error('ROL_TIPO_NO_ENCONTRADO'));

    await expect(crearUsuarioService({
      logeo: 'mozo',
      clave: 'ClaveSegura123',
      tipo: 'MOZO',
      empleadoId: 7,
      estado: 'A',
    }, actor)).rejects.toMatchObject({
      code: 'ROL_TIPO_NO_ENCONTRADO',
    });
  });

  it('surfaces missing matching role during user type update', async () => {
    mocks.actualizarUsuario.mockRejectedValue(new Error('ROL_TIPO_NO_ENCONTRADO'));

    await expect(actualizarUsuarioService(8, {
      tipo: 'ADMINISTRADOR',
      motivo: 'Cambio autorizado de perfil',
    }, actor)).rejects.toMatchObject({
      code: 'ROL_TIPO_NO_ENCONTRADO',
    });
  });

  it('surfaces when a mapped role cannot be deactivated', async () => {
    mocks.guardarRol.mockRejectedValue(new Error('ROL_TIPO_EN_USO'));

    await expect(guardarRolService(3, {
      nombre: 'MOZO',
      descripcion: 'Atiende mesas',
      estado: 'I',
      permisoIds: [],
      motivo: 'Se intenta desactivar el rol asociado',
    }, actor)).rejects.toMatchObject({
      code: 'ROL_TIPO_EN_USO',
    });
  });
});
