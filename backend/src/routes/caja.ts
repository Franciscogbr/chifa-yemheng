import { Router } from 'express';
import {
  getCajaMaestros,
  getCajaActa,
  getCajaIncidencias,
  getCajaHistorialCajero,
  getCajaReporteDiferencias,
  getCajaPendientes,
  getCierresPendientes,
  patchCajaIncidencia,
  postCajaArqueo,
  postCajaRechazarCierre,
  postCajaCierre,
  postCajaCobro,
  postCajaCobroParticipante,
  postCajaConfirmarCierre,
  postCajaMovimiento,
  postCajaTurno,
  getCajaComprobante,
} from '../controllers/caja-controller.js';
import { authGuard } from '../middlewares/auth-guard.js';
import { requirePermisos } from '../middlewares/permission-guard.js';

export const cajaRouter = Router();

cajaRouter.use(authGuard);
cajaRouter.get(
  '/maestros',
  requirePermisos('CAJ_APERTURAR', 'CAJA_APERTURA', 'VEN_COBRAR', 'PED_VER', 'PED_REGISTRAR', 'CAJ_VALIDAR_CIERRE'),
  getCajaMaestros,
);
cajaRouter.get(
  '/pendientes',
  requirePermisos('CAJ_APERTURAR', 'CAJA_APERTURA', 'VEN_COBRAR', 'PED_VER', 'PED_REGISTRAR', 'CAJ_VALIDAR_CIERRE'),
  getCajaPendientes,
);
cajaRouter.get('/cierres/pendientes', requirePermisos('CAJ_VALIDAR_CIERRE'), getCierresPendientes);
cajaRouter.post(
  '/turno',
  requirePermisos('CAJ_APERTURAR', 'CAJA_APERTURA'),
  postCajaTurno,
);
cajaRouter.post('/turno/cierre', requirePermisos('CAJ_CERRAR'), postCajaCierre);
cajaRouter.post('/turno/cierre/confirmar', requirePermisos('CAJ_VALIDAR_CIERRE'), postCajaConfirmarCierre);
cajaRouter.post('/turno/cierre/rechazar', requirePermisos('CAJ_VALIDAR_CIERRE'), postCajaRechazarCierre);
cajaRouter.post(
  '/cobro',
  requirePermisos('VEN_COBRAR', 'VEN_EMITIR'),
  postCajaCobro,
);
cajaRouter.post(
  '/cobro-participante',
  requirePermisos('VEN_COBRAR', 'VEN_EMITIR'),
  postCajaCobroParticipante,
);
cajaRouter.post('/movimientos', requirePermisos('CAJ_EGRESO'), postCajaMovimiento);
cajaRouter.post(
  '/cierre/arqueo',
  requirePermisos('CAJ_CERRAR', 'CAJ_VALIDAR_CIERRE', 'CAJ_APERTURAR', 'CAJA_APERTURA'),
  postCajaArqueo,
);
cajaRouter.get(
  '/incidencias',
  requirePermisos('CAJ_VALIDAR_CIERRE', 'CAJA_APERTURA', 'VEN_COBRAR', 'CAJ_APERTURAR'),
  getCajaIncidencias,
);
cajaRouter.patch(
  '/incidencias/:id',
  requirePermisos('CAJ_VALIDAR_CIERRE'),
  patchCajaIncidencia,
);
cajaRouter.get(
  '/turno/:id/acta',
  requirePermisos('CAJ_VALIDAR_CIERRE', 'VEN_COBRAR', 'CAJ_APERTURAR', 'CAJA_APERTURA', 'CAJ_CERRAR'),
  getCajaActa,
);
cajaRouter.get(
  '/reportes/diferencias',
  requirePermisos('CAJ_VALIDAR_CIERRE'),
  getCajaReporteDiferencias,
);
cajaRouter.get(
  '/reportes/cajeros',
  requirePermisos('CAJ_VALIDAR_CIERRE'),
  getCajaHistorialCajero,
);
cajaRouter.get(
  '/comprobante/:id',
  requirePermisos('CAJ_VALIDAR_CIERRE', 'VEN_COBRAR', 'CAJ_APERTURAR', 'CAJA_APERTURA'),
  getCajaComprobante,
);
