import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ListingController } from '../controllers/listing.controller';
import { asyncHandler } from '../middleware/asyncHandler.middleware';

const router = Router();

// Ensure local disk storage upload file pathway folders exist safely on host machine
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage properties and random file name layouts for disk writing
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB individual file limit protection guard
});

// GET /api/listings - Fetch all listings or apply cursor filters
router.get('/', asyncHandler(ListingController.getAll));

// 🚀 FIXED ORDER: GET /api/listings/user/me - Private authenticated inventory feed
// CRITICAL: This is registered ABOVE the /:slug parameter line to prevent namespace hijacking!
router.get('/user/me', asyncHandler(ListingController.getUserListings));

// POST /api/listings - Intercepts multi-part array uploads mapped to key 'images'
router.post('/', upload.array('images', 8), asyncHandler(ListingController.create));

// GET /api/listings/:slug - Resolves dynamic path links for the product detail page view
router.get('/:slug', asyncHandler(ListingController.getBySlug));

export default router;