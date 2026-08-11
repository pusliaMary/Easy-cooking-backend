const jwt = require('jsonwebtoken');

module.exports.generateTokens = (username) => {
	const accessToken = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '24h' });
	return { accessToken };
};

module.exports.authenticate = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return res.status(401).json({ message: "Токен отсутствует" });
	}

	const token = authHeader.startsWith("Bearer ")
		? authHeader.slice(7)
		: authHeader;

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.username = decoded.username;
		next();
	} catch (err) {
		return res.status(401).json({ message: "Недействительный токен" });
	}
};
