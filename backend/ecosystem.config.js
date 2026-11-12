module.exports = {
  apps: [
    {
      name: 'chifa-backend',
      script: 'dist/server.js',
      cwd: '/var/www/chifa-backend',
      instances: 'max',
      exec_mode: 'cluster',
      max_restarts: 3,
      min_uptime: '10s',
      max_memory_restart: '1G',
      log_file: '/var/log/chifa-backend/combined.log',
      error_file: '/var/log/chifa-backend/error.log',
      out_file: '/var/log/chifa-backend/out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      env_production: {
        NODE_ENV: 'production',
        LOG_LEVEL: 'warn',
        LOG_PRETTY: 'false',
        LOG_FILE_PATH: '/var/log/chifa-backend/app.log',
        SENTRY_ENVIRONMENT: 'production'
      }
    }
  ]
};
