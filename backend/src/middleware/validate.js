// Usage: router.post('/register', validate(registerSchema), controller.register)
// Parses req.body against the zod schema; replaces req.body with the parsed
// (and type-coerced) result so handlers get clean data. Throws a ZodError on
// failure, which the centralized error handler turns into a 400.
function validate(schema) {
  return (req, res, next) => {
    req.body = schema.parse(req.body);
    next();
  };
}

// Same idea, but for req.query (e.g. catalog filters) instead of req.body.
function validateQuery(schema) {
  return (req, res, next) => {
    req.query = schema.parse(req.query);
    next();
  };
}

module.exports = { validate, validateQuery };
