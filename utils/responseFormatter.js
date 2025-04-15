const successResponse = (res, data, message = "Success", statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (
  res,
  message = "Error",
  statusCode = 400,
  error = null
) => {
  const response = {
    success: false,
    message,
  };

  if (error && process.env.NODE_ENV === "development") {
    response.error = error;
  }

  res.status(statusCode).json(response);
};

const paginatedResponse = (res, data, pagination, message = "Success") => {
  res.status(200).json({
    success: true,
    message,
    data: data,
    pagination,
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
};
