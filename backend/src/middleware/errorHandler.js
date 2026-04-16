function notFoundHandler(_req, res) {
  return res.status(404).json({ message: 'Route not found.' });
}

function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Internal server error.';

  if (status >= 500) {
    console.error('[ServerError]', err);
  }

  return res.status(status).json({ message });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
