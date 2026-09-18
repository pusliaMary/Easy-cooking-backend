import { SignJWT, jwtVerify } from 'jose';

// jose требует, чтобы секрет был в виде Uint8Array для нативного крипто-движка
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export const generateTokens = async (username) => {
  // Нативная асинхронная генерация токена на 2 часа
  const accessToken = await new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h') 
    .sign(JWT_SECRET);

  return { accessToken };
};

export const authenticate = async (req, res, next) => {
  const token = req.cookies ? req.cookies.authToken : null;

  if (!token) {
    return res.status(401).json({ message: "Токен отсутствует или сессия истекла" });
  }

  try {
    // Нативная асинхронная проверка токена
    const { payload } = await jwtVerify(token, JWT_SECRET);
    req.username = payload.username;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Сессия истекла. Войдите заново" });
  }
};

export const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
