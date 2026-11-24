/**
 * C-Tech Trade Desk — Production Sliding-Window Rate Limiter
 * In-memory sliding-window log rate limiter with automatic garbage collection,
 * standard rate limit headers (X-RateLimit-*, Retry-After), and proxy IP awareness.
 */

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = forwarded.split(',').map((ip) => ip.trim());
    if (ips[0]) return ips[0];
  }
  return req.ip || req.socket?.remoteAddress || '127.0.0.1';
}

function createRateLimiter({
  windowMs = 60 * 1000,
  max = 100,
  message = 'Too many requests, please try again later.',
  statusCode = 429,
  keyGenerator = getClientIp,
} = {}) {
  // Map of clientKey -> array of request timestamps (epoch ms)
  const store = new Map();

  // Periodic cleanup every 5 minutes
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of store.entries()) {
      const validTimestamps = timestamps.filter((t) => now - t < windowMs);
      if (validTimestamps.length === 0) {
        store.delete(key);
      } else {
        store.set(key, validTimestamps);
      }
    }
  }, 5 * 60 * 1000);

  // Unref interval so it doesn't hold open Node process on shutdown
  if (cleanupInterval.unref) cleanupInterval.unref();

  return function rateLimitMiddleware(req, res, next) {
    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    let timestamps = store.get(key) || [];
    timestamps = timestamps.filter((t) => t > windowStart);

    const remaining = Math.max(0, max - timestamps.length);
    const oldestTimestamp = timestamps[0] || now;
    const resetTime = Math.ceil((oldestTimestamp + windowMs) / 1000);

    // Standard rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetTime);

    // Skip rate limit enforcement in automated testing if configured
    if (process.env.DISABLE_RATE_LIMIT === 'true') {
      return next();
    }

    if (timestamps.length >= max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((oldestTimestamp + windowMs - now) / 1000));
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(statusCode).json({
        statusCode,
        error: 'Too Many Requests',
        message,
        retryAfter: retryAfterSeconds,
      });
    }

    timestamps.push(now);
    store.set(key, timestamps);
    next();
  };
}

// 1. Global API Limiter: 300 req / minute per IP
const globalLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 300,
  message: 'System traffic threshold exceeded. Please slow down your requests.',
});

// 2. Auth Endpoints Limiter: 15 req / minute per IP (brute-force defense)
const authLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 15,
  message: 'Too many authentication attempts. Please wait 60 seconds before trying again.',
});

// 3. OTP Dispatch Limiter: 5 req / minute per IP (prevents SMS/Email abuse & financial drain)
const otpLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many verification code requests. For security reasons, please wait a minute.',
});

module.exports = {
  createRateLimiter,
  globalLimiter,
  authLimiter,
  otpLimiter,
};
