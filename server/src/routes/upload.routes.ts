import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Only authenticated users can request image upload privileges
router.get('/sign', requireAuth, asyncHandler(UploadController.getSignature));

export default router;