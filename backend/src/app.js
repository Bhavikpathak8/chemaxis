const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { errorHandler } = require('./middleware/error');
const { globalLimiter } = require('./middleware/rate-limit');
const { pool, getPoolStats } = require('./db/pool');

function createApp() {
  const app = express();

  // Trust proxy for reverse proxy deployments (Docker, Nginx, Cloudflare)
  app.set('trust proxy', 1);

  // Enforce HTTPS in production or when FORCE_HTTPS is true
  if (process.env.FORCE_HTTPS === 'true' || (process.env.NODE_ENV === 'production' && !process.env.ALLOW_HTTP_IN_PROD)) {
    app.use((req, res, next) => {
      const proto = req.headers['x-forwarded-proto'];
      if (proto && proto !== 'https') {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
      }
      next();
    });
  }

  // Security headers with Helmet
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow uploaded documents to be displayed cross-origin
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production'
          ? {
              directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'blob:'],
                connectSrc: ["'self'", 'http:', 'https:'],
                fontSrc: ["'self'", 'data:'],
                objectSrc: ["'none'"],
              },
            }
          : false,
    }),
  );

  // Response compression (gzip/deflate)
  app.use(compression());

  // Global rate limiter (300 req / minute per IP)
  app.use(globalLimiter);

  const explicitOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const corsOptions = {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        process.env.NODE_ENV !== 'production' ||
        explicitOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1|\d+\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin) ||
        /\.ngrok(-free)?\.app$/.test(origin) ||
        /\.loca\.lt$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'Retry-After'],
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ---------------------------------------------------------------------------
  // Health & Readiness Probes
  // ---------------------------------------------------------------------------
  // 1. Liveness check: Is process alive and accepting HTTP traffic?
  app.get('/api/v1/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'chemaxis-institutional-trade-desk-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // 2. Readiness check: Deep probe verifying database connection & connection pool
  app.get('/api/v1/health/ready', async (req, res) => {
    const startTime = Date.now();
    try {
      const dbRes = await pool.query('SELECT 1 AS connected, NOW() AS db_time');
      const latencyMs = Date.now() - startTime;
      const poolStats = await getPoolStats();
      const memoryUsage = process.memoryUsage();

      res.json({
        status: 'ready',
        database: {
          connected: Boolean(dbRes.rows[0]?.connected),
          latencyMs,
          dbTime: dbRes.rows[0]?.db_time,
          pool: poolStats,
        },
        system: {
          uptimeSeconds: Math.floor(process.uptime()),
          nodeVersion: process.version,
          memoryMb: {
            rss: Math.round(memoryUsage.rss / 1024 / 1024),
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[Health Check Failed]', err.message);
      res.status(503).json({
        status: 'not_ready',
        error: 'Database connection failed',
        message: err.message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // ---------------------------------------------------------------------------
  // Application Feature Routes
  // ---------------------------------------------------------------------------
  app.use('/api/v1/auth', require('./modules/auth/auth.routes'));
  app.use('/api/v1/users', require('./modules/users/users.routes'));
  app.use('/api/v1/chemicals', require('./modules/chemicals/chemicals.routes'));
  app.use('/api/v1/sellers', require('./modules/sellers/sellers.routes'));
  app.use('/api/v1/buyers', require('./modules/buyers/buyers.routes'));
  app.use('/api/v1/quotation-requests', require('./modules/quotations/quotations.routes'));
  app.use('/api/v1/purchase-orders', require('./modules/purchase-orders/documents.routes'));
  app.use('/api/v1/purchase-orders', require('./modules/purchase-orders/purchase-orders.routes'));
  app.use('/api/v1/transport-vendors', require('./modules/transport-vendors/transport-vendors.routes'));
  app.use('/api/v1/drivers', require('./modules/drivers/drivers.routes'));
  app.use('/api/v1/transportation', require('./modules/transportation/transportation.routes'));
  app.use('/api/v1/expenses', require('./modules/expenses/expenses.routes'));
  app.use('/api/v1/gst-settings', require('./modules/gst-settings/gst-settings.routes'));
  app.use('/api/v1/invoices', require('./modules/invoices/invoices.routes'));
  app.use('/api/v1/payments', require('./modules/payments/payments.routes'));

  app.use('/api/v1/notifications', require('./modules/notifications/notifications.routes'));
  app.use('/api/v1/audit-logs', require('./modules/audit-logs/audit-logs.routes'));
  app.use('/api/v1/margin-policies', require('./modules/margin-policies/margin-policies.routes'));
  app.use('/api/v1/expense-categories', require('./modules/expense-categories/expense-categories.routes'));

  app.use('/api/v1/files', require('./modules/files/files.routes'));
  app.use('/api/v1/analytics', require('./modules/analytics/analytics.routes'));
  app.use('/api/v1/exports', require('./modules/exports/exports.routes'));
  app.use('/api/v1/backup', require('./modules/backup/backup.routes'));

  // Serve frontend static build if present (Unified monolithic deployment)
  const clientDist = path.resolve(__dirname, '../../frontend/dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return next();
      }
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
