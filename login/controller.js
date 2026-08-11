const { generateTokens } = require('../auth/auth.middleware');
require('dotenv').config();

module.exports.authController = {
	async login(req, res) {
		try {
			const { username, password } = req.body;

			if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
				return res.status(400).json({ message: 'Invalid credentials' });
			}
			const tokens = generateTokens(username);
			res.json(tokens);

		} catch (err) {
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	logout(_, res) {
		try {
			res.status(200).json({ message: 'Logout successful' });
		} catch (e) {
			res.status(500).json({ message: 'Internal server error. Please Try again later.' });
		}
	}
};