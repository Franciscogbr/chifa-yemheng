import { Router } from 'express';
import {
  getPedido,
  getPedidos,
  getCocina,
  getEntregasMozo,
  getReservasEsperandoMozo,
  patchAnular,
  patchPedirCuenta,
  patchPreparacion,
  patchEntregarDetalle,
  postDetalle,
  postPedido,
  postAbrirPedidoReservaMozo,
  postRecalcular,
} from '../controllers/pedidos-controller.js';
import { authGuard } from '../middlewares/auth-guard.js';
import { requirePermisos, requirePermisosORoles } from '../middlewares/permission-guard.js';
import { asyncHandler } from '../utils/async-handler.js';

export const pedidosRouter = Router();

pedidosRouter.use(authGuard);
pedidosRouter.get(
  '/cocina',
  requirePermisos('PED_COCINA', 'PED_VER', 'PED_REGISTRAR'),
  asyncHandler(getCocina),
);
pedidosRouter.get(
  '/mozo/entregas',
  requirePermisosORoles(['PED_VER', 'PED_ENTREGAR', 'PED_REGISTRAR'], ['MOZO']),
  asyncHandler(getEntregasMozo),
);
pedidosRouter.get(
  '/mozo/reservas-pendientes',
  requirePermisosORoles(['PED_VER'], ['MOZO']),
  asyncHandler(getReservasEsperandoMozo),
);
pedidosRouter.post(
  '/mozo/reservas/:id/abrir',
  requirePermisosORoles(['PED_REGISTRAR'], ['MOZO']),
  asyncHandler(postAbrirPedidoReservaMozo),
);
pedidosRouter.get('/', requirePermisos('PED_VER'), asyncHandler(getPedidos));
pedidosRouter.get('/:id', requirePermisos('PED_VER'), asyncHandler(getPedido));
pedidosRouter.post('/', requirePermisos('PED_REGISTRAR'), asyncHandler(postPedido));
pedidosRouter.post('/:id/detalles', requirePermisos('PED_REGISTRAR'), asyncHandler(postDetalle));
pedidosRouter.patch(
  '/:id/detalles/:idDetalle/preparacion',
  requirePermisos('PED_COCINA'),
  asyncHandler(patchPreparacion),
);
pedidosRouter.patch(
  '/:id/detalles/:idDetalle/entrega',
  requirePermisosORoles(['PED_ENTREGAR', 'PED_REGISTRAR'], ['MOZO']),
  asyncHandler(patchEntregarDetalle),
);
pedidosRouter.patch(
  '/:id/pedir-cuenta',
  requirePermisos('PED_EDITAR', 'PED_REGISTRAR'),
  asyncHandler(patchPedirCuenta),
);
pedidosRouter.patch('/:id/anular', requirePermisos('PED_ANULAR'), asyncHandler(patchAnular));
pedidosRouter.post('/:id/recalcular', requirePermisos('PED_REGISTRAR'), asyncHandler(postRecalcular));