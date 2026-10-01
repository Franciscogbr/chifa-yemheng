import { Router } from 'express';
import {
  getCliente,
  getClientes,
  patchClienteEstado,
  postCliente,
  putCliente,
} from '../controllers/clientes-controller.js';
import { authGuard } from '../middlewares/auth-guard.js';
import { requirePermisos } from '../middlewares/permission-guard.js';

export const clientesRouter = Router();

clientesRouter.use(authGuard);
clientesRouter.get('/', requirePermisos('CLI_VER'), getClientes);
clientesRouter.get('/:id', requirePermisos('CLI_VER'), getCliente);
clientesRouter.post('/', requirePermisos('CLI_CREAR'), postCliente);
clientesRouter.put('/:id', requirePermisos('CLI_EDITAR'), putCliente);
clientesRouter.patch('/:id/estado', requirePermisos('CLI_ELIMINAR'), patchClienteEstado);
