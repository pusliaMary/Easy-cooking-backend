export const createAppError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export const notFound = (req, res, next) => {
  next(createAppError(`Маршрут не найден - ${req.originalUrl}`, 404));
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Внутренняя ошибка сервера";

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Некорректный формат ID: "${err.value}" для поля ${err.path}`;
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  if (err.code === 11000) {
    statusCode = 400;
    const duplicatedField = Object.keys(err.keyValue || {});
    message = `Значение для поля [${duplicatedField}] уже существует в базе данных.`;
  }

  if (err.code === "ERR_JWT_EXPIRED") {
    statusCode = 401;
    message = "Срок действия вашей сессии истек. Войдите заново.";
  }
  if (
    err.code === "ERR_JWS_INVALID" ||
    err.code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED"
  ) {
    statusCode = 401;
    message = "Невалидный токен сессии. Доступ отклонен.";
  }

  if (err.message === "Not allowed by CORS") {
    statusCode = 403;
    message = "Доступ к API заблокирован политикой CORS для вашего домена.";
  }

  if (statusCode === 500) {
    console.error("💥 КРИТИЧЕСКАЯ ОШИБКА НА СЕРВЕРЕ:", err);
  }

  res.status(statusCode).json({
    status: "error",
    message: message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
