import { Router } from 'express';
import { loginAdmin, logoutAdmin, refreshAccessToken } from '../controllers/authController';
import { validateRequest } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/authMiddleware';
import { LoginSchema, RefreshTokenSchema } from '../utils/validators';

const router = Router();

router.post('/login', validateRequest(LoginSchema), loginAdmin);
router.post('/logout', authMiddleware, logoutAdmin);
router.post('/refresh-token', validateRequest(RefreshTokenSchema), refreshAccessToken);

export default router;
