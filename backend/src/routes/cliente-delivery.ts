import { Router } from 'express';
import { getClienteDeliveryActivo, getClienteDeliveryDetalle, getClienteDeliveryUbicacion, getClienteDeliveryComprobante, getSugerirCostoCliente, getCoberturaDeliveryCliente, postClienteDelivery } from '../controllers/cliente-delivery-controller.js';
import { clienteAuthGuard } from '../middlewares/cliente-auth-guard.js';
import { asyncHandler } from '../utils/async-handler.js';

export const clienteDeliveryRouter = Router();

clienteDeliveryRouter.use(clienteAuthGuard);
clienteDeliveryRouter.get('/', asyncHandler(getClienteDeliveryActivo));
clienteDeliveryRouter.get('/cobertura', asyncHandler(getCoberturaDeliveryCliente));
clienteDeliveryRouter.post('/', asyncHandler(postClienteDelivery));
clienteDeliveryRouter.get('/sugerir-costo', asyncHandler(getSugerirCostoCliente));
clienteDeliveryRouter.get('/:id', asyncHandler(getClienteDeliveryDetalle));
clienteDeliveryRouter.get('/:id/ubicacion', asyncHandler(getClienteDeliveryUbicacion));
clienteDeliveryRouter.get('/:id/comprobante', asyncHandler(getClienteDeliveryComprobante));