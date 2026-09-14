import express from 'express';
import { authController } from './controller.js';
import { authenticate } from '../auth/auth.middleware.js';

const router = express.Router();

router.post('/login', authController.login);
router.delete('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.checkAuth);

export default router;