function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || "Internal Server Error";

  if (["ENOTFOUND", "EAI_AGAIN", "ECONNREFUSED"].includes(err.code)) {
    status = 503;
    message = "Database connection failed. Check backend DB environment variables.";
  }

  res.status(status).json({
    message
  });
}

module.exports = errorHandler;
