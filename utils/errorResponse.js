const getErrorStatusCode = (error) => {
  const suppliedStatus = Number(error?.statusCode || error?.status);
  if (Number.isInteger(suppliedStatus) && suppliedStatus >= 400 && suppliedStatus <= 599) {
    return suppliedStatus;
  }
  if (error?.code === 11000) return 409;
  if (['ValidationError', 'CastError'].includes(error?.name)) return 400;
  return 500;
};

const respondWithError = (res, error) => {
  const statusCode = getErrorStatusCode(error);
  const isProduction = process.env.NODE_ENV === 'production';
  if (statusCode >= 500) console.error(error);

  return res.status(statusCode).json({
    success: false,
    message: isProduction && statusCode >= 500 ? 'Internal server error' : error?.message || 'Request failed',
    ...(!isProduction ? { stack: error?.stack } : {}),
  });
};

module.exports = { getErrorStatusCode, respondWithError };