import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { errorHandler, notFoundHandler } from './middlewares/error-handler.js';
import { httpLogger } from './loggers/pino-http.js';
import { requestLogger, responseLogger } from './middleware/request-logger.js';
import { sentryRequestHandler, sentryErrorHandler } from './middleware/sentry.js';
import { env } from './config/env.js';
import { loggingConfig } from './config/logging.js';
import { factilizaRouter } from './routes/factiliza.js';
import { authRouter } from './routes/auth.js';
import { auditoriaRouter } from './routes/auditoria.js';
import { clienteAuthRouter } from './routes/cliente-auth.js';
import { clienteReservasRouter } from './routes/cliente-reservas.js';
import { deliveryRouter } from './routes/delivery.js';
import { seguimientoRouter } from './routes/delivery-seguimiento.js';
import { clienteDeliveryRouter } from './routes/cliente-delivery.js';
import { repartidorRouter } from './routes/repartidor.js';
import { rendicionRouter } from './routes/rendiciones.js';
import { inventarioRouter } from './routes/inventario.js';
import { reportesRouter } from './routes/reportes.js';
import { reservasRouter } from './routes/reservas.js';
import { seguridadRouter } from './routes/seguridad.js';
import { clientePedidosRouter } from './routes/cliente-pedidos.js';
import { categoriasRouter } from './routes/categorias.js';
import { clientesRouter } from './routes/clientes.js';
import { dashboardRouter } from './routes/dashboard.js';
import { healthRouter } from './routes/health.js';
import { cajaRouter } from './routes/caja.js';
import { maestrosRouter } from './routes/maestros.js';
import { mesasRouter } from './routes/mesas.js';
import { pedidosRouter } from './routes/pedidos.js';
import { personalRouter } from './routes/personal.js';
import { productosRouter } from './routes/productos.js';
import { tiposMesaRouter } from './routes/tipos-mesa.js';
import { unidadesRouter } from './routes/unidades.js';
import { ventasRouter } from './routes/ventas.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', env.TRUST_PROXY_HOPS);

  app.use(cors());
  app.use(express.json());

  // Sentry request handler (captura requests como breadcrumbs para contexto de errores)
  app.use(sentryRequestHandler);

  // Structured logging (replaces/replaces morgan in production)
  app.use(httpLogger);
  app.use(requestLogger);
  app.use(responseLogger);

  if (!loggingConfig.isProduction && !loggingConfig.isTest) {
    app.use(morgan('dev'));
  }

  app.use(
    rateLimit({
      windowMs: 60_000,
      max: 120,
    }),
  );

  app.use('/api/v1/health', healthRouter);
  app.use('/api/v1/maestros', maestrosRouter);
  app.use('/api/v1/mesas', mesasRouter);
  app.use('/api/v1/pedidos', pedidosRouter);
  app.use('/api/v1/caja', cajaRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/factiliza', factilizaRouter);
  app.use('/api/v1/cliente/reservas', clienteReservasRouter);
  app.use('/api/v1/cliente', clienteAuthRouter);
  app.use('/api/v1/cliente/pedidos', clientePedidosRouter);
  app.use('/api/v1/cliente/delivery', clienteDeliveryRouter);
  app.use('/api/v1/repartidor', repartidorRouter);
  app.use('/api/v1/delivery', deliveryRouter);
  app.use('/api/v1/delivery/seguimiento', seguimientoRouter);
  app.use('/api/v1/rendiciones', rendicionRouter);
  app.use('/api/v1/categorias', categoriasRouter);
  app.use('/api/v1/clientes', clientesRouter);
  app.use('/api/v1/dashboard', dashboardRouter);
  app.use('/api/v1/personal', personalRouter);
  app.use('/api/v1/productos', productosRouter);
  app.use('/api/v1/unidades', unidadesRouter);
  app.use('/api/v1/tipos-mesa', tiposMesaRouter);
  app.use('/api/v1/ventas', ventasRouter);

  app.use('/api/v1/auditoria', auditoriaRouter);
  app.use('/api/v1/inventario', inventarioRouter);
  app.use('/api/v1/reportes', reportesRouter);
  app.use('/api/v1/reservas', reservasRouter);
  app.use('/api/v1/seguridad', seguridadRouter);


  app.use(notFoundHandler);
  app.use(errorHandler);
  app.use(sentryErrorHandler);

  return app;
}
