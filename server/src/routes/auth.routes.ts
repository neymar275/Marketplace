import { Router } from 'express';
import { 
  registerUser, 
  loginUser, 
  refreshToken, 
  logoutUser 
} from '../controllers/auth.controller';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { authLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Create a new marketplace user profile
 */
router.post('/register', authLimiter, asyncHandler(registerUser));

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and issue session token cookies
 */
router.post('/login', authLimiter, asyncHandler(loginUser));

/**
 * @route   POST /api/auth/refresh
 * @desc    Rotate expired access tokens using a valid refresh token
 */
router.post('/refresh', asyncHandler(refreshToken));

/**
 * @route   POST /api/auth/logout
 * @desc    Clear active authorization session state
 */
router.post('/logout', asyncHandler(logoutUser));

export default router;