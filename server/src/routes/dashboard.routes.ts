import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Protect this route: Must be logged in
router.get('/stats', requireAuth, asyncHandler(DashboardController.getStats));

export default router;