const { AppError } = require('../utils/errors');

// Wraps an async route handler so thrown errors/rejected promises reach the
// error middleware below, instead of crashing the process (Express 4 doesn't
// do this automatically for async handlers).
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// Must be registered LAST, after all routes.
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // zod validation errors
  if (err.name === 'ZodError') {
    const message = err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    return res.status(400).json({ message });
  }

  // Postgres: malformed UUID / enum value in a URL or query string
  if (err.code === '22P02') {
    return res.status(400).json({ message: 'Invalid identifier or value in request' });
  }

  // Postgres unique-constraint violation
  if (err.code === '23505') {
    return res.status(409).json({ message: 'A record with these details already exists' });
  }

  console.error(err);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
}

module.exports = { asyncHandler, errorHandler };
