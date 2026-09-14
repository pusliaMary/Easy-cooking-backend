import { generateTokens } from "../auth/auth.middleware.js";
import "dotenv/config"

export const authController = {
 async login(req, res) {
  try {
    const { username, password } = req.body;

    if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const { accessToken } = generateTokens(username); 

    const isProduction = process.env.NODE_ENV === 'production' || req.get('host').includes('onrender.com');

    if (typeof res.cookie !== 'function') {
      throw new Error("Библиотека cookie-parser не подключена или подключена неправильно в app.js!");
    }

    res.cookie('authToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.json({ username });

  } catch (err) {
    return res.status(500).json({ 
      message: 'Internal server error', 
      dev_message: err.message, 
      stack: err.stack 
    });
  }
},

  async checkAuth(req, res) {
    try {
      return res.json({ username: req.username });
    } catch (err) {
      return res.status(401).json({ message: "Сессия недействительна" });
    }
  },

  logout(req, res) {
    try {
      const isProduction =
        process.env.NODE_ENV === "production" ||
        req.get("host").includes("onrender.com");

      res.clearCookie("authToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
      });
      return res.status(200).json({ message: "Logout successful" });
    } catch (e) {
      return res
        .status(500)
        .json({ message: "Internal server error. Please Try again later." });
    }
  },
};
