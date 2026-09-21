import { SignJWT, jwtVerify } from 'jose';
import { catchAsync, createAppError } from './error.middleware.js';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export const generateTokens = async (username) => {
  const accessToken = await new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h') 
    .sign(JWT_SECRET);

  return { accessToken };
};

export const authenticate = catchAsync(async (req, res, next) => {
  const token = req.cookies ? req.cookies.authToken : null;

  if (!token) {
    return next(createAppError("Токен отсутствует или сессия истекла", 401));
  }

  const { payload } = await jwtVerify(token, JWT_SECRET);
  
  req.username = payload.username;
  next();
});
