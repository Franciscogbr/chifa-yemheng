import { Router } from 'express';
import {
  getCargos,
  getContratos,
  getDistritos,
  getTiposIdentidad,
} from '../controllers/maestros-controller.js';
import { authGuard } from '../middlewares/auth-guard.js';
import { requirePermisos } from '../middlewares/permission-guard.js';

export const maestrosRouter = Router();

maestrosRouter.use(authGuard);
maestrosRouter.get(
  '/distritos',
  requirePermisos('EMP_VER', 'CLI_VER'),
  getDistritos,
);
maestrosRouter.get('/cargos', requirePermisos('EMP_VER'), getCargos);
maestrosRouter.get('/contratos', requirePermisos('EMP_VER'), getContratos);
maestrosRouter.get(
  '/tipos-identidad',
  requirePermisos('EMP_VER', 'CLI_VER'),
  getTiposIdentidad,
);
