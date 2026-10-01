import { Router } from 'express';
import { getResumen } from '../controllers/dashboard-controller.js';
import { authGuard } from '../middlewares/auth-guard.js';
import { requirePermisos } from '../middlewares/permission-guard.js';

export const dashboardRouter = Router();

dashboardRouter.use(authGuard);
dashboardRouter.get('/resumen', requirePermisos('DASHBOARD_VER'), getResumen);
