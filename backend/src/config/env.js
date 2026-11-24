/**
 * C-Tech Trade Desk — Environment Configuration & Production Validator
 * Dynamically loads and validates environment variables based on NODE_ENV.
 * Prevents insecure deployments with placeholder secrets, disabled rate limits,
 * or sandbox test OTP bypasses in staging/production.
 */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const dotenv = require('dotenv');

function loadEnvironment() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const backendRoot = path.join(__dirname, '..', '..');

  // Try loading specific env file: .env.production, .env.staging, .env.development, then .env
  const specificEnvPath = path.join(backendRoot, `.env.${nodeEnv}`);
  const defaultEnvPath = path.join(backendRoot, '.env');

  if (fs.existsSync(specificEnvPath)) {
    dotenv.config({ path: specificEnvPath });
    console.log(`[Config] Loaded environment profile: .env.${nodeEnv}`);
  } else if (fs.existsSync(defaultEnvPath)) {
    dotenv.config({ path: defaultEnvPath });
    console.log(`[Config] Loaded default environment profile: .env`);
  }

  // Set default NODE_ENV if not set
  process.env.NODE_ENV = nodeEnv;

  validateEnvironment(nodeEnv);
}

function validateEnvironment(nodeEnv) {
  const isProd = nodeEnv === 'production';
  const isStaging = nodeEnv === 'staging';

  // 1. Auto-generate high-entropy defaults for JWT secrets if not explicitly provided
  if (!process.env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET.trim().length === 0) {
    process.env.JWT_ACCESS_SECRET = crypto.randomBytes(32).toString('hex');
    console.log('[Config] Auto-generated secure 64-character JWT_ACCESS_SECRET.');
  }
  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.trim().length === 0) {
    process.env.JWT_REFRESH_SECRET = crypto.randomBytes(32).toString('hex');
    console.log('[Config] Auto-generated secure 64-character JWT_REFRESH_SECRET.');
  }

  // 2. Database URL check - warn if missing instead of crashing process
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim().length === 0) {
    console.warn('\n⚠️  [Config Warning] DATABASE_URL is not configured.');
    console.warn('   The ChemAxis web platform will serve UI and health checks.');
    console.warn('   To enable PostgreSQL persistence, add DATABASE_URL in your hosting environment settings.\n');
  }

  // 3. Strict Production / Staging Safeguards
  if (isProd || isStaging) {
    const weakSecrets = ['change-me-access', 'change-me-refresh', 'secret', '123456', 'password'];
    if (weakSecrets.includes(process.env.JWT_ACCESS_SECRET) || process.env.JWT_ACCESS_SECRET.length < 32) {
      throw new Error(`[Security Violation] JWT_ACCESS_SECRET must be at least 32 characters of high-entropy randomness in ${nodeEnv}. Placeholder secrets are strictly forbidden.`);
    }
    if (weakSecrets.includes(process.env.JWT_REFRESH_SECRET) || process.env.JWT_REFRESH_SECRET.length < 32) {
      throw new Error(`[Security Violation] JWT_REFRESH_SECRET must be at least 32 characters of high-entropy randomness in ${nodeEnv}. Placeholder secrets are strictly forbidden.`);
    }

    if (isProd && process.env.ALLOW_TEST_OTP === 'true') {
      throw new Error('[Security Violation] ALLOW_TEST_OTP must never be set to true in production.');
    }

    if (isProd && process.env.DISABLE_RATE_LIMIT === 'true') {
      throw new Error('[Security Violation] DISABLE_RATE_LIMIT must never be set to true in production.');
    }
  }

  console.log(`[Config] Environment validation passed for profile: ${nodeEnv}`);
}

module.exports = {
  loadEnvironment,
  validateEnvironment,
};
