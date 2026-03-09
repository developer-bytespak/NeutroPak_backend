import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { CreateProductSchema, UpdateProductSchema } from '../utils/validators';

const router = Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, validateRequest(CreateProductSchema), createProduct);
router.put('/:id', authMiddleware, adminMiddleware, validateRequest(UpdateProductSchema), updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

export default router;
