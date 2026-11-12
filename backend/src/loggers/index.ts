import pino from 'pino';
import type { Logger } from 'pino';
import { loggingConfig } from '../config/logging.js';

const transport = loggingConfig.pretty && !loggingConfig.isTest
  ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss.l',
        ignore: 'pid,hostname',
      },
    }
  : undefined;

const fileTransport = loggingConfig.filePath && loggingConfig.isProduction
  ? {
      target: 'pino/file',
      options: {
        destination: loggingConfig.filePath,
        mkdir: true,
      },
      level: 'info',
    }
  : undefined;

const transports = [transport, fileTransport].filter(Boolean);

export const logger: Logger = (pino as any)(
  {
    level: loggingConfig.level,
    redact: [
      'req.headers.authorization',
      'req.body.clave',
      'req.body.password',
      'req.body.token',
      'res.body.clave',
      'res.body.password',
    ],
    base: {
      env: process.env.NODE_ENV ?? 'development',
      service: 'chifa-backend',
      version: process.env.npm_package_version ?? '1.0.0',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transports.length > 0 ? pino.multistream(transports.map((t) => ({ stream: t as any, level: (t as { level?: string }).level ?? 'info' }))) : undefined
);

export const childLogger = (module: string) => logger.child({ module });

export default logger;
