import * as Sentry from '@sentry/node';
import { loggingConfig } from './logging.js';

export function initSentry(): void {
  if (!loggingConfig.sentryDsn || loggingConfig.isTest) {
    return;
  }

  Sentry.init({
    dsn: loggingConfig.sentryDsn,
    environment: loggingConfig.sentryEnvironment,
    release: process.env.npm_package_version ?? '1.0.0',
    tracesSampleRate: 1.0,
    maxValueLength: 256,
    sendDefaultPii: false,
    beforeSend(event: Sentry.Event): Sentry.Event | null {
      // No enviar eventos de prueba o de health check a Sentry
      if (event.request?.url?.includes('/api/v1/health')) {
        return null;
      }
      // Redactar headers de autorización
      if (event.request?.headers?.authorization) {
        event.request.headers.authorization = '[REDACTED]';
      }
      return event;
    },
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
    ],
  });
}

export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (loggingConfig.isTest) {
    return;
  }
  Sentry.captureException(error, { contexts: { custom: context } });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, unknown>): void {
  if (loggingConfig.isTest) {
    return;
  }
  Sentry.captureMessage(message, { level, contexts: { custom: context } });
}

export function setUser(user: { id: number; email?: string; username?: string }): void {
  Sentry.setUser({ id: user.id, email: user.email, username: user.username });
}

export function setTag(key: string, value: string): void {
  Sentry.setTag(key, value);
}

export function setContext(key: string, context: Record<string, unknown>): void {
  Sentry.setContext(key, context);
}

export default {
  init: initSentry,
  captureException,
  captureMessage,
  setUser,
  setTag,
  setContext,
};
