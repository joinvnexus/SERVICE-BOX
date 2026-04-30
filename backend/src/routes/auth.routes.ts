import { Router } from 'express';
import { register, login, getCurrentUser } from '../controllers/auth.controller.ts';
import { authMiddleware } from '../middleware/auth.middleware.ts';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getCurrentUser);

export default router;