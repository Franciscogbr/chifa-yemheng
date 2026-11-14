import { Router } from 'express';
import { getCostoReceta, getMovimientos, getRecetas, getStock, getStockBajo, patchReceta, postMovimiento, postReceta } from '../controllers/inventario-controller.js';
import { getKardex } from '../controllers/kardex-controller.js';
import { authGuard } from '../middlewares/auth-guard.js';
import { requirePermisos } from '../middlewares/permission-guard.js';
import { asyncHandler } from '../utils/async-handler.js';

export const inventarioRouter = Router();

inventarioRouter.use(authGuard);
inventarioRouter.get('/movimientos', requirePermisos('INV_VER'), asyncHandler(getMovimientos));
inventarioRouter.post('/movimientos', requirePermisos('INV_CREAR'), asyncHandler(postMovimiento));
inventarioRouter.get('/stock', requirePermisos('INV_VER'), asyncHandler(getStock));
inventarioRouter.get('/stock/bajo', requirePermisos('INV_VER'), asyncHandler(getStockBajo));
inventarioRouter.get('/recetas/costo', requirePermisos('REC_VER'), asyncHandler(getCostoReceta));
inventarioRouter.get('/recetas', requirePermisos('REC_VER'), asyncHandler(getRecetas));
inventarioRouter.post('/recetas', requirePermisos('REC_CREAR'), asyncHandler(postReceta));
inventarioRouter.patch('/recetas/:id', requirePermisos('REC_EDITAR'), asyncHandler(patchReceta));
inventarioRouter.get('/kardex', requirePermisos('INV_KARDEX'), asyncHandler(getKardex));
