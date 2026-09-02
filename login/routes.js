const express = require('express');
const router = express.Router();
const { authController } = require('./controller');
const { authenticate } = require('../auth/auth.middleware');

router.post('/login', authController.login);
router.delete('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.checkAuth);

module.exports = router;