import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth-guard.js';
import { getMiEntrega, getMisEntregas, getPorRendir, postConfirmarEntrega, postIniciarRuta, postRegistrarVenta, postUbicacion } from '../controllers/repartidor-controller.js';
import { authGuard } from '../middlewares/auth-guard.js';
import { requirePermisos } from '../middlewares/permission-guard.js';
import { asyncHandler } from '../utils/async-handler.js';

export const repartidorRouter = Router();

repartidorRouter.use(authGuard);
repartidorRouter.use((req: Request, res: Response, next: NextFunction) => {
  if (!(req as AuthenticatedRequest).user.empleadoId) {
    res.status(403).json({ error: 'REPARTIDOR_EMPLEADO_NOT_FOUND' });
    return;
  }
  next();
});
repartidorRouter.get('/entregas', requirePermisos('DELIVERY_VER'), asyncHandler(getMisEntregas));
repartidorRouter.get('/entregas/:id', requirePermisos('DELIVERY_VER'), asyncHandler(getMiEntrega));
repartidorRouter.patch('/entregas/:id/ruta', requirePermisos('DELIVERY_ENTREGAR'), asyncHandler(postIniciarRuta));
repartidorRouter.patch('/entregas/:id/entregar', requirePermisos('DELIVERY_ENTREGAR'), asyncHandler(postConfirmarEntrega));
repartidorRouter.patch('/entregas/:id/venta', requirePermisos('DELIVERY_ENTREGAR'), asyncHandler(postRegistrarVenta));
repartidorRouter.post('/entregas/:id/ubicacion', requirePermisos('DELIVERY_ENTREGAR'), asyncHandler(postUbicacion));
repartidorRouter.get('/por-rendir', requirePermisos('DELIVERY_VER'), asyncHandler(getPorRendir));