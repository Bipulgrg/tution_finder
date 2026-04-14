const { ApiError } = require("../utils/apiError");

function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!parsed.success) {
      return next(
        new ApiError(400, "VALIDATION_ERROR", "Validation failed", {
          issues: parsed.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        })
      );
    }

    req.validated = parsed.data;
    return next();
  };
}

module.exports = { validate };
