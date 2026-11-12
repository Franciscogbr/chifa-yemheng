import type { NextFunction, Request, Response } from 'express';
import httpLogger from '../loggers/pino-http.js';
import { logger } from '../loggers/index.js';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  httpLogger(req, res, (err?: Error) => {
    if (err) {
      next(err);
      return;
    }
    next();
  });
};

export const responseLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      reqId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
      userId: (req as any).user?.sub,
      ip: req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'],
    };

    if (res.statusCode >= 500) {
      logger.error(logData, 'Request error');
    } else if (res.statusCode >= 400) {
      logger.warn(logData, 'Request client error');
    } else {
      logger.info(logData, 'Request completed');
    }
  });

  next();
};

export default requestLogger;
