import pinoHttp from 'pino-http';
import { logger } from './index.js';
import { loggingConfig } from '../config/logging.js';

export const httpLogger = pinoHttp({
  logger,
  redactReqBody: ['clave', 'password', 'token', 'authorization'],
  redactResBody: ['clave', 'password', 'token'],
  customLogLevel: (res: { statusCode: number }, err?: Error) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customRequestId: (req) => {
    const existing = req.headers['x-request-id'] as string;
    return existing ?? crypto.randomUUID();
  },
  serializers: {
    req: (req) => {
      const headers = req.headers || {};
      const body = req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH'
        ? { ...req.body, clave: '[REDACTED]', password: '[REDACTED]' }
        : undefined;
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        headers: {
          'user-agent': headers['user-agent'],
          'content-type': headers['content-type'],
        },
        remoteAddress: req.socket?.remoteAddress,
        remotePort: req.socket?.remotePort,
        body,
        query: req.query,
        params: req.params,
      };
    },
    res: (res) => {
      let contentType;
      try {
        contentType = res.getHeaders?.()['content-type'];
      } catch {}
      return {
        statusCode: res.statusCode,
        headers: {
          'content-type': contentType,
        },
      };
    },
    err: (err) => ({
      type: err.type,
      message: err.message,
      stack: err.stack,
    }),
  },
  enabled: !loggingConfig.isTest,
});

export default httpLogger;
