export const loggingConfig = {
  level: process.env.LOG_LEVEL ?? 'info',
  pretty: process.env.LOG_PRETTY === 'true',
  filePath: process.env.LOG_FILE_PATH,
  sentryDsn: process.env.SENTRY_DSN,
  sentryEnvironment: process.env.SENTRY_ENVIRONMENT ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  isDevelopment: process.env.NODE_ENV === 'development',
};
