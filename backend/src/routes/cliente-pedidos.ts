import { Router } from 'express';
import {
  getClienteComandaActiva,
  getClienteComprobante,
  getClientePedidoDetalle,
  getClienteMiCuenta,
  getClientePedidosActivos,
  getClienteReservaAtencion,
  patchClienteCuenta,
  patchClienteModoPago,
  postClienteDetalle,
  postClientePedido,
  postClienteElegirAtencion,
  postClienteRecalcular,
  postClienteTanda,
} from '../controllers/cliente-pedidos-controller.js';
import { clienteAuthGuard } from '../middlewares/cliente-auth-guard.js';

export const clientePedidosRouter = Router();

clientePedidosRouter.use(clienteAuthGuard);
// GET /comanda debe registrarse antes de /:id para no colisionar.
clientePedidosRouter.get('/activos', getClientePedidosActivos);
clientePedidosRouter.get('/comanda', getClienteComandaActiva);
clientePedidosRouter.get('/reserva/:id/atencion', getClienteReservaAtencion);
clientePedidosRouter.get('/:id/comprobante', getClienteComprobante);
clientePedidosRouter.get('/:id/mi-cuenta', getClienteMiCuenta);
clientePedidosRouter.get('/:id', getClientePedidoDetalle);
clientePedidosRouter.post('/', postClientePedido);
clientePedidosRouter.post('/tanda', postClienteTanda);
clientePedidosRouter.post('/reserva/atencion', postClienteElegirAtencion);
clientePedidosRouter.post('/:id/detalles', postClienteDetalle);
clientePedidosRouter.post('/:id/recalcular', postClienteRecalcular);
clientePedidosRouter.patch('/:id/modo-pago', patchClienteModoPago);
clientePedidosRouter.patch('/cuenta', patchClienteCuenta);
