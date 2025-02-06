import express from 'express';

import authController from '../controller/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authController.login);
router.post('/refresh', authController.refreshTokenHandler);
router.post('/logout', authMiddleware, authController.logout);

export { router };
