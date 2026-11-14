import { Router } from 'express';
import {
  deleteClienteReserva,
  getContinuacionReservaCliente,
  getMisReservasCli,
  postClienteReserva,
} from '../controllers/cliente-reservas-controller.js';
import { clienteAuthGuard } from '../middlewares/cliente-auth-guard.js';

export const clienteReservasRouter = Router();

clienteReservasRouter.use(clienteAuthGuard);
clienteReservasRouter.get('/', getMisReservasCli);
clienteReservasRouter.post('/', postClienteReserva);
clienteReservasRouter.get('/:id/continuar', getContinuacionReservaCliente);
clienteReservasRouter.delete('/:id', deleteClienteReserva);
