import type { NextFunction, Request, Response } from 'express';
import { logger } from '../loggers/index.js';
import { PedidoError } from '../models/pedido.js';
import { PersonalError } from '../models/personal.js';
import { loggingConfig } from '../config/logging.js';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode ?? 500;
  const isOperational = err.isOperational ?? true;

  const errorLog = {
    message: err.message,
    stack: err.stack,
    code: err.code,
    statusCode,
    isOperational,
    timestamp: new Date().toISOString(),
  };

  if (statusCode >= 500) {
    logger.error(errorLog, 'Unhandled server error');
  } else {
    logger.warn(errorLog, 'Handled application error');
  }

  const responseBody: Record<string, unknown> = {
    error: err.code ?? 'INTERNAL_ERROR',
    message: isOperational ? err.message : 'Error interno del servidor',
  };

  if (!loggingConfig.isProduction || isOperational) {
    responseBody.detalle = err.message;
  }

  if (loggingConfig.isDevelopment || loggingConfig.isTest) {
    responseBody.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  logger.warn(
    { url: _req.originalUrl, method: _req.method, ip: _req.socket?.remoteAddress },
    'Route not found'
  );
  res.status(404).json({ error: 'NOT_FOUND', message: 'Ruta no encontrada' });
};
