import { Router } from 'express';
import {
  postDatosDni,
  postDatosRuc,
} from '../controllers/factiliza-controller.js';
import { authGuard } from '../middlewares/auth-guard.js';
import { requirePermisos } from '../middlewares/permission-guard.js';

export const factilizaRouter = Router();

factilizaRouter.use(authGuard);
factilizaRouter.post('/dni', requirePermisos('EMP_VER'), postDatosDni);
factilizaRouter.post('/ruc', requirePermisos('EMP_VER'), postDatosRuc);
