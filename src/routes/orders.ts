import { Router } from 'express';
import {
  createOrder,
  getOrderById,
  listOrders,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/orderController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { CreateOrderSchema, UpdateOrderStatusSchema } from '../utils/validators';

const router = Router();

// Public routes
router.post('/', validateRequest(CreateOrderSchema), createOrder);
router.get('/:id', getOrderById);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, listOrders);
router.put('/:id', authMiddleware, adminMiddleware, validateRequest(UpdateOrderStatusSchema), updateOrderStatus);
router.delete('/:id', authMiddleware, adminMiddleware, deleteOrder);

export default router;
