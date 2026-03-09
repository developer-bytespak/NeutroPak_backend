import { Router } from 'express';
import { uploadImage, uploadMultiple, deleteImage } from '../controllers/uploadController';
import { upload, cleanupTempFile } from '../middleware/uploadMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

// All upload routes require authentication
router.use(authMiddleware);

/**
 * POST /api/upload/image
 * Upload a single image
 * Query params: folder (optional, default: neutropak/media)
 */
router.post('/image', upload.single('file'), cleanupTempFile, uploadImage);

/**
 * POST /api/upload/multiple
 * Upload multiple images
 * Query params: folder (optional, default: neutropak/media)
 */
router.post('/multiple', upload.array('files', 10), cleanupTempFile, uploadMultiple);

/**
 * DELETE /api/upload/image
 * Delete an image from Cloudinary
 * Body: { public_id: string }
 */
router.delete('/image', deleteImage);

export default router;
