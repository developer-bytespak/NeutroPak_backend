import { Router } from 'express';
import {
  createContact,
  getAllContacts,
  getContactById,
  deleteContact,
} from '../controllers/contactController';
import { validateRequest } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';
import { CreateContactSchema, ContactQuerySchema } from '../utils/validators';

const router = Router();

/**
 * Public Routes
 */
// Create contact submission (public)
router.post('/', validateRequest(CreateContactSchema), createContact);

/**
 * Admin Routes (Protected with auth and admin middleware)
 */
// Get all contacts (admin only)
router.get('/', authMiddleware, adminMiddleware, validateRequest(ContactQuerySchema, 'query'), getAllContacts);

// Get single contact by ID (admin only)
router.get('/:id', authMiddleware, adminMiddleware, getContactById);

// Delete contact (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, deleteContact);

export default router;
