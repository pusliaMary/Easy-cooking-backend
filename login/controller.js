const { generateTokens } = require('../auth/auth.middleware');
require('dotenv').config();

module.exports.authController = {
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      
      const { accessToken } = generateTokens(username);

      res.cookie('authToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000
      });

      return res.json({ username });

    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  logout(_, res) {
    try {
      res.clearCookie('authToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      });
      
      return res.status(200).json({ message: 'Logout successful' });
    } catch (e) {
      return res.status(500).json({ message: 'Internal server error. Please Try again later.' });
    }
  }
};
