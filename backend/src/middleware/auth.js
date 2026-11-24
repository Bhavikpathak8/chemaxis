const { verifyAccessToken } = require('../utils/jwt');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
const { pool } = require('../db/pool');

// Verifies the Bearer token and attaches { id, email, role } to req.user.
// Re-checks is_active against the DB on every request (not just what the
// token claims) so a deactivated account is locked out immediately, even
// if their token hasn't expired yet.
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or malformed Authorization header');
    }
    const token = header.slice('Bearer '.length);
    const payload = verifyAccessToken(token);

    const { rows } = await pool.query(
      `SELECT id, email, role, full_name, is_active, is_email_verified, is_phone_verified,
              two_factor_enabled, token_version
       FROM users WHERE id = $1`,
      [payload.sub],
    );
    const user = rows[0];
    if (!user || !user.is_active) {
      throw new UnauthorizedError('Account not found or deactivated');
    }

    if (payload.tokenVersion && user.token_version !== payload.tokenVersion) {
      throw new UnauthorizedError('Your session has expired due to a security update. Please sign in again.');
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
      isEmailVerified: user.is_email_verified,
      isPhoneVerified: user.is_phone_verified,
      twoFactorEnabled: user.two_factor_enabled,
    };
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Invalid or expired token'));
    }
    next(err);
  }
}

// Usage: router.get('/admin-only', authenticate, requireRole('SUPER_ADMIN', 'TRADER_STAFF'), handler)
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError(`This action requires one of: ${roles.join(', ')}`));
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
