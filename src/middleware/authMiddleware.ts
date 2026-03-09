import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { errorResponse } from '../utils/responseFormatter';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      errorResponse(res, 'AuthenticationError', 'Missing or invalid authentication token', 401);
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
    errorResponse(res, 'AuthenticationError', 'Invalid or expired token', 401);
  }
};
