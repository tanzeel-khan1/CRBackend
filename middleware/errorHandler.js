const { respondWithError } = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  return respondWithError(res, err);
};

module.exports = errorHandler;