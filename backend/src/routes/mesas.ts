import { Router } from 'express';
import {
  getAmbientes,
  getMesa,
  getMesaPorQr,
  getMesas,
  getOcupacion,
  patchAmbienteEstado,
  patchMesaEstado,
  postAmbiente,
  postMesa,
  putAmbiente,
  putMesa,
} from '../controllers/mesas-controller.js';
import { authGuard } from '../middlewares/auth-guard.js';
import { requirePermisos } from '../middlewares/permission-guard.js';

export const mesasRouter = Router();

// Público (sin sesión): el QR físico pegado en la mesa es el secreto.
// Debe ir antes de `authGuard` y de `/:id` para no colisionar.
mesasRouter.get('/by-qr', getMesaPorQr);

mesasRouter.use(authGuard);
mesasRouter.get('/ambientes/todos', requirePermisos('MESA_VER'), getAmbientes);
mesasRouter.post('/ambientes', requirePermisos('MESA_CREAR'), postAmbiente);
mesasRouter.put('/ambientes/:id', requirePermisos('MESA_EDITAR'), putAmbiente);
mesasRouter.patch('/ambientes/:id/estado', requirePermisos('MESA_ELIMINAR'), patchAmbienteEstado);
mesasRouter.get('/', requirePermisos('MESA_VER'), getMesas);
mesasRouter.get('/ocupacion', requirePermisos('MESA_VER'), getOcupacion);
mesasRouter.get('/:id', requirePermisos('MESA_VER'), getMesa);
mesasRouter.post('/', requirePermisos('MESA_CREAR'), postMesa);
mesasRouter.put('/:id', requirePermisos('MESA_EDITAR'), putMesa);
mesasRouter.patch('/:id/estado', requirePermisos('MESA_ELIMINAR'), patchMesaEstado);
