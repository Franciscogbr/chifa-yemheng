import type { NextFunction, Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import { captureException } from '../config/sentry.js';
import { loggingConfig } from '../config/logging.js';

export const sentryErrorHandler = (
  err: Error,
  _req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!loggingConfig.isTest) {
    captureException(err, {
      url: _req.originalUrl,
      method: _req.method,
      userId: (_req as any).user?.sub,
      ip: _req.socket?.remoteAddress,
    });
  }
  next(err);
};

export const sentryRequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!loggingConfig.isTest) {
    // Capturar requests como breadcrumbs para contexto en errores
    Sentry.addBreadcrumb({
      message: `${req.method} ${req.originalUrl}`,
      category: 'http',
      level: 'info',
      data: {
        method: req.method,
        url: req.originalUrl,
        userId: (req as any).user?.sub,
      },
    });
  }
  next();
};
