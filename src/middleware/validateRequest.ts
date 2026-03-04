import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { errorResponse } from '../utils/responseFormatter';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error: any) {
      console.error('=== VALIDATION ERROR ===');
      console.error('Request body:', JSON.stringify(req.body, null, 2));
      
      if (error.name === 'ZodError') {
        const details: any = {};
        
        if (Array.isArray(error.errors)) {
          error.errors.forEach((err: any) => {
            const fieldPath = err.path && Array.isArray(err.path) ? err.path.join('.') : 'unknown';
            details[fieldPath] = err.message;
          });
        }
        
        console.error('Validation details:', details);
        errorResponse(res, 'ValidationError', 'Request validation failed', 400, details);
      } else {
        console.error('Non-validation error:', error);
        errorResponse(res, 'ValidationError', error.message || 'Invalid request', 400);
      }
    }
  };
};
