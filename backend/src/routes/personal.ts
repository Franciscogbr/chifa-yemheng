import { Router } from 'express';
import {
  getEmpleado,
  getPersonal,
  patchEmpleadoEstado,
  postEmpleado,
  putEmpleado,
} from '../controllers/personal-controller.js';
import { authGuard } from '../middlewares/auth-guard.js';
import { requirePermisos } from '../middlewares/permission-guard.js';

export const personalRouter = Router();

personalRouter.use(authGuard);
personalRouter.get('/', requirePermisos('EMP_VER'), getPersonal);
personalRouter.get('/:id', requirePermisos('EMP_VER'), getEmpleado);
personalRouter.post('/', requirePermisos('EMP_CREAR'), postEmpleado);
personalRouter.put('/:id', requirePermisos('EMP_EDITAR'), putEmpleado);
personalRouter.patch('/:id/estado', requirePermisos('EMP_ELIMINAR'), patchEmpleadoEstado);
