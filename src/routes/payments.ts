import { Router } from 'express';
import {
  listPayments,
  getPaymentById,
  markPaymentCollected,
} from '../controllers/paymentController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { UpdatePaymentSchema } from '../utils/validators';

const router = Router();

// Admin routes
router.get('/', authMiddleware, adminMiddleware, listPayments);
router.get('/:id', authMiddleware, adminMiddleware, getPaymentById);
router.put('/:id', authMiddleware, adminMiddleware, validateRequest(UpdatePaymentSchema), markPaymentCollected);

export default router;
