import { generateTokens } from "../middlewares/auth.middleware.js";
import { catchAsync, createAppError } from "../middlewares/error.middleware.js";
import "dotenv/config";

// Хелпер для определения продакшена (вынесен наружу, чтобы не дублировать код)
const getIsProduction = (req) => {
  return process.env.NODE_ENV === "production" || req.get("host").includes("onrender.com");
};

/**
 * 1. Авторизация (Вход)
 */
export const login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  // Если учетные данные неверные, генерируем стандартную клиентскую ошибку 400
  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return next(createAppError("Неверное имя пользователя или пароль", 400));
  }

  const { accessToken } = await generateTokens(username);
  const isProduction = getIsProduction(req);

  if (typeof res.cookie !== "function") {
    return next(createAppError("Библиотека cookie-parser не подключена или подключена неправильно!", 500));
  }

  // Устанавливаем куку строго на 2 часа
  res.cookie("authToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 2 * 60 * 60 * 1000, // 2 часа в миллисекундах
  });

  return res.status(200).json({ username });
});

/**
 * 2. Проверка текущей авторизации
 * Избавились от try-catch. Если токен в мидлваре authenticate сломается, 
 * выполнение сюда даже не дойдет, а ошибку обработает errorHandler.
 */
export const checkAuth = catchAsync(async (req, res, next) => {
  return res.status(200).json({ username: req.username });
});

/**
 * 3. Логаут (Выход)
 * Больше не асинхронный (убран async), так как здесь нет await операций.
 * Обертка catchAsync все равно добавлена на случай непредвиденных сбоев.
 */
export const logout = catchAsync(async (req, res, next) => {
  const isProduction = getIsProduction(req);

  res.clearCookie("authToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
  
  return res.status(200).json({ success: true, message: "Выход из системы успешен" });
});
