import { Router } from 'express';
import { registerUser, loginUser, refreshToken, logoutUser } from '../controllers/auth.controller';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { authLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/register', authLimiter, asyncHandler(registerUser));
router.post('/login', authLimiter, asyncHandler(loginUser));
router.post('/refresh', asyncHandler(refreshToken));
router.post('/logout', asyncHandler(logoutUser));

export default router;