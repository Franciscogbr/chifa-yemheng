import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { errorHandler, notFoundHandler } from './middlewares/error-handler.js';
import { authRouter } from './routes/auth.js';
import { categoriasRouter } from './routes/categorias.js';
import { clientesRouter } from './routes/clientes.js';
import { dashboardRouter } from './routes/dashboard.js';
import { healthRouter } from './routes/health.js';
import { maestrosRouter } from './routes/maestros.js';
import { mesasRouter } from './routes/mesas.js';
import { personalRouter } from './routes/personal.js';
import { productosRouter } from './routes/productos.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));
  app.use(
    rateLimit({
      windowMs: 60_000,
      max: 120,
    }),
  );

  app.use('/api/v1/health', healthRouter);
  app.use('/api/v1/maestros', maestrosRouter);
  app.use('/api/v1/mesas', mesasRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/categorias', categoriasRouter);
  app.use('/api/v1/clientes', clientesRouter);
  app.use('/api/v1/dashboard', dashboardRouter);
  app.use('/api/v1/personal', personalRouter);
  app.use('/api/v1/productos', productosRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
