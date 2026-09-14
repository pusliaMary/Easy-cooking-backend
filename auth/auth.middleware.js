import jwt from 'jsonwebtoken';

export const generateTokens = (username) => {
  const accessToken = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '24h' });
  return { accessToken };
};
export const authenticate = (req, res, next) => {
  const token = req.cookies ? req.cookies.authToken : null;

  if (!token) {
    return res.status(401).json({ message: "Токен отсутствует или сессия истекла" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.username = decoded.username;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Недействительный токен" });
  }
};
