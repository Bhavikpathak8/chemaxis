/**
 * C-Tech Chemical Trading Platform — PM2 Production Ecosystem Configuration
 * For bare-metal / VPS deployments without Docker
 * Usage: pm2 start ecosystem.config.js --env production
 */

module.exports = {
  apps: [
    {
      name: 'ctech-api',
      script: './src/server.js',
      cwd: './backend',
      instances: 'max',       // Cluster mode: 1 worker per CPU core
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
        FORCE_HTTPS: 'true',
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 4000,
        FORCE_HTTPS: 'false',
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
    },
  ],
};
