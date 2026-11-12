import { Router } from 'express';
import {
  getClienteComandaActiva,
  getClientePedidoDetalle,
  getClienteMiCuenta,
  getClientePedidosActivos,
  patchClienteCuenta,
  patchClienteModoPago,
  postClienteDetalle,
  postClientePedido,
  postClienteRecalcular,
  postClienteTanda,
} from '../controllers/cliente-pedidos-controller.js';
import { clienteAuthGuard } from '../middlewares/cliente-auth-guard.js';

export const clientePedidosRouter = Router();

clientePedidosRouter.use(clienteAuthGuard);
// GET /comanda debe registrarse antes de /:id para no colisionar.
clientePedidosRouter.get('/activos', getClientePedidosActivos);
clientePedidosRouter.get('/comanda', getClienteComandaActiva);
clientePedidosRouter.get('/:id/mi-cuenta', getClienteMiCuenta);
clientePedidosRouter.get('/:id', getClientePedidoDetalle);
clientePedidosRouter.post('/', postClientePedido);
clientePedidosRouter.post('/tanda', postClienteTanda);
clientePedidosRouter.post('/:id/detalles', postClienteDetalle);
clientePedidosRouter.post('/:id/recalcular', postClienteRecalcular);
clientePedidosRouter.patch('/:id/modo-pago', patchClienteModoPago);
clientePedidosRouter.patch('/cuenta', patchClienteCuenta);
