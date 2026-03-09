import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/responseFormatter';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    errorResponse(res, 'AuthenticationError', 'Authentication required', 401);
    return;
  }

  if (req.user.role !== 'admin') {
    errorResponse(res, 'ForbiddenError', 'You do not have permission to access this resource', 403);
    return;
  }

  next();
};
