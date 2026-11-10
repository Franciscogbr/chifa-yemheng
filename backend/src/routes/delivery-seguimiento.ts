import { Router } from 'express';
import { getSeguimiento, getUbicacionSeguimiento, patchAnular, patchConfirmarEntregaStaff, patchIniciarRutaStaff, patchRegistrarVentaStaff } from '../controllers/seguimiento-controller.js';
import { authGuard } from '../middlewares/auth-guard.js';
import { requirePermisos } from '../middlewares/permission-guard.js';
import { asyncHandler } from '../utils/async-handler.js';

export const seguimientoRouter = Router();

seguimientoRouter.use(authGuard);
seguimientoRouter.get('/', requirePermisos('DELIVERY_VER'), asyncHandler(getSeguimiento));
seguimientoRouter.patch('/:id/ruta', requirePermisos('DELIVERY_DESPACHAR'), asyncHandler(patchIniciarRutaStaff));
seguimientoRouter.patch('/:id/entregar', requirePermisos('DELIVERY_ENTREGAR'), asyncHandler(patchConfirmarEntregaStaff));
seguimientoRouter.patch('/:id/anular', requirePermisos('DELIVERY_VER'), asyncHandler(patchAnular));
seguimientoRouter.patch('/:id/venta', requirePermisos('DELIVERY_ENTREGAR'), asyncHandler(patchRegistrarVentaStaff));
seguimientoRouter.get('/:id/ubicacion', requirePermisos('DELIVERY_VER'), asyncHandler(getUbicacionSeguimiento));