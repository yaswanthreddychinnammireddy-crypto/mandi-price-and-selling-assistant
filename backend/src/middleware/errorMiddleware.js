function notFound(req, res) { res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` }); }
function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(error);
  const status = error.statusCode || (error.name === 'ZodError' ? 400 : 500);
  res.status(status).json({ success: false, message: status === 500 ? 'Internal server error.' : error.message, errors: error.issues });
}
module.exports = { notFound, errorHandler };
